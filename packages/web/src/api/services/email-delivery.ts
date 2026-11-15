import { createHash } from "node:crypto";
import { and, eq, gt, lte, ne, or, sql } from "drizzle-orm";
import { db } from "../database";
import { emailDeliveries, contactMessages, notifications } from "../database/schema";
import { emailClient, emailEnabled, emailSender, emailLink } from "./email-policy";
import { contactReceiptEmail, type EmailContent } from "./email-templates";
import { requireCollection } from "./collection-config";
import { site } from "../../shared/site-config";

export function emailEventID(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

type PreparedDelivery = {
  event: string;
  kind: "verification" | "welcome" | "submission" | "contact-receipt";
  to: string;
  replyTo?: string;
  userId?: string;
  expiresAt?: Date;
  content: EmailContent;
};

type Delivery = Omit<PreparedDelivery, "kind"> & {
  kind: "verification" | "welcome" | "submission";
} | { kind: "contact-receipt"; contactId: string };

// Internal service only, never mounted as a browser-callable send endpoint.
export async function deliverEmail(request: Delivery) {
  if (!emailEnabled()) return "disabled" as const;
  let input: PreparedDelivery;
  if (request.kind === "contact-receipt") {
    // Never accept a caller-supplied recipient/body for visitor receipts.
    // Require legal/collection/retention gates and a fresh purge heartbeat.
    try { await requireCollection("contact"); } catch { return "disabled" as const; }
    const [contact] = await db.select().from(contactMessages)
      .where(eq(contactMessages.id, request.contactId)).limit(1);
    if (!contact || contact.expiresAt.getTime() <= Date.now()) return "disabled" as const;
    input = {
      event: `contact-receipt:${contact.id}`, kind: "contact-receipt",
      to: contact.email, expiresAt: contact.expiresAt,
      content: contactReceiptEmail(contact.id, emailLink("/contact")),
    };
  } else {
    input = request;
    let recipient = site.adminEmail;
    if (input.kind === "submission") {
      const id = input.event.startsWith("submission:") ? input.event.slice("submission:".length) : "";
      const [record] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
      if (!record || record.expiresAt.getTime() <= Date.now()) return "disabled" as const;
      if (record.kind === "contact") {
        try { await requireCollection("contact"); } catch { return "disabled" as const; }
      }
      recipient = record.kind === "contact" ? site.email : site.adminEmail;
    }
    if (input.to.toLowerCase() !== recipient) throw new Error("Destinataire non autorisé.");
  }
  if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) return "disabled" as const;
  const now = new Date();
  const id = emailEventID(input.event);
  await db.insert(emailDeliveries).values({
    id, kind: input.kind, userId: input.userId, state: "pending", attempts: 0,
    createdAt: now, updatedAt: now, leaseUntil: new Date(0), expiresAt: input.expiresAt,
  }).onConflictDoNothing();
  const [previous] = await db.select().from(emailDeliveries).where(eq(emailDeliveries.id, id)).limit(1);
  if (previous?.state === "sent") return "sent" as const;
  let client;
  try { client = await emailClient(); }
  catch {
    await db.update(emailDeliveries).set({ state: "failed", updatedAt: now }).where(and(
      eq(emailDeliveries.id, id), eq(emailDeliveries.attempts, 0), lte(emailDeliveries.leaseUntil, now),
    ));
    return "failed" as const;
  }
  // Resend retains idempotency keys for 24h. Never silently resend an uncertain
  // old attempt after that window; an operator must reconcile it with Resend.
  const [claimed] = await db.update(emailDeliveries).set({
    leaseUntil: new Date(now.getTime() + 60_000), updatedAt: now,
    createdAt: sql`CASE WHEN ${emailDeliveries.attempts}=0 THEN ${now.getTime()} ELSE ${emailDeliveries.createdAt} END`,
    attempts: sql`${emailDeliveries.attempts}+1`,
  }).where(and(
    eq(emailDeliveries.id, id), ne(emailDeliveries.state, "sent"),
    lte(emailDeliveries.leaseUntil, now),
    or(eq(emailDeliveries.attempts, 0), gt(emailDeliveries.createdAt, new Date(now.getTime() - 23 * 3600_000))),
  )).returning();
  if (!claimed) return "failed" as const;
  try {
    const result = await client.emails.send({
      from: emailSender, to: input.to, ...(input.replyTo ? { replyTo: input.replyTo } : {}), ...input.content,
    }, { idempotencyKey: `bandfinvest-${id}`, signal: AbortSignal.timeout(15_000) });
    if (result.error || !result.data?.id) throw new Error("Envoi refusé ou résultat inconnu.");
    await db.update(emailDeliveries).set({
      state: "sent", providerId: result.data.id, updatedAt: new Date(), leaseUntil: new Date(0),
    }).where(eq(emailDeliveries.id, id));
    return "sent" as const;
  } catch {
    // Keep the original payload out of both the DB and logs. Registration and
    // submission state are not rolled back because an optional email failed.
    await db.update(emailDeliveries).set({
      state: "failed", updatedAt: new Date(), leaseUntil: new Date(0),
    }).where(eq(emailDeliveries.id, id));
    return "failed" as const;
  }
}