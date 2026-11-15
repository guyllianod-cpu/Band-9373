import { eq, sql } from "drizzle-orm";
import { db } from "../database";
import { notifications, user, contactMessages } from "../database/schema";
import { site } from "../../shared/site-config";
import { deliverEmail } from "./email-delivery";
import { emailEnabled, emailLink, verificationLink } from "./email-policy";
import { contactNotificationEmail, submissionEmail, verificationEmail, welcomeEmail } from "./email-templates";

export async function sendVerification(to: string, url: string) {
  if (to.toLowerCase() !== site.adminEmail) throw new Error("Adresse non autorisée.");
  if (!emailEnabled()) throw new Error("Notifications non configurées.");
  const safeURL = verificationLink(url);
  const result = await deliverEmail({
    event: `verification:${to.toLowerCase()}:${safeURL}`, kind: "verification", to: site.adminEmail,
    expiresAt: new Date(Date.now() + 24 * 3600_000), content: verificationEmail(safeURL),
  });
  if (result !== "sent") throw new Error("Échec de la notification de vérification.");
}

export async function sendWelcome(id: string) {
  if (!emailEnabled()) return "disabled";
  const [account] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (!account || !account.emailVerified || account.email.toLowerCase() !== site.adminEmail) return "disabled";
  return deliverEmail({
    event: `welcome:${account.id}`, kind: "welcome", to: site.adminEmail, userId: account.id,
    content: welcomeEmail(emailLink("/administration")),
  });
}

// Optional welcome email must never turn a successful account verification
// into a failed auth response. Failed attempts remain in the delivery ledger.
export async function onVerifiedAccount(account: { id: string; emailVerified: boolean }) {
  if (!account.emailVerified || !emailEnabled()) return;
  try { await sendWelcome(account.id); }
  catch { console.warn("BAND FINVEST : bienvenue non envoyée ; vérifier la configuration serveur."); }
}
export async function notifySubmission(id: string) {
  const [record] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  if (!record || record.expiresAt.getTime() <= Date.now()) return "disabled";
  if (record.state === "sent") return "sent";
  if (!emailEnabled()) return "disabled";
  try {
    const [contact] = record.kind === "contact"
      ? await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1)
      : [];
    if (record.kind === "contact" && (!contact || contact.expiresAt.getTime() <= Date.now())) return "disabled";
    const content = contact
      ? contactNotificationEmail({ ...contact, message: (contact.data as { message: string }).message }, emailLink("/administration"))
      : submissionEmail(id, record.kind, emailLink("/administration"));
    const result = await deliverEmail({
      event: `submission:${id}`, kind: "submission", to: contact ? site.email : site.adminEmail,
      ...(contact ? { replyTo: contact.email } : {}),
      expiresAt: record.expiresAt,
      content,
    });
    if (result !== "sent") throw new Error("Notification non envoyée.");
    await db
      .update(notifications)
      .set({ state: "sent", attempts: sql`${notifications.attempts}+1` })
      .where(eq(notifications.id, id));
    return "sent";
  } catch {
    await db
      .update(notifications)
      .set({ state: "failed", attempts: sql`${notifications.attempts}+1` })
      .where(eq(notifications.id, id));
    return "failed";
  }
}

// Only an already-persisted, non-expired contact can produce a receipt.
// Failure must never roll back the saved message or trigger a new submission.
export async function sendContactReceipt(contactId: string) {
  try { return await deliverEmail({ kind: "contact-receipt", contactId }); }
  catch { return "failed" as const; }
}
