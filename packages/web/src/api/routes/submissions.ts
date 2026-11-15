import { eq, gt, and } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { projectRequest, contactRequest, type ContactData } from "../../shared/submission-schemas";
import { site } from "../../shared/site-config";
import { db } from "../database";
import { projectSubmissions, contactMessages, notifications } from "../database/schema";
import { authEnabled, submissionEnabled, requireCollection } from "../services/collection-config";
import { addCalendarMonth } from "../services/retention";
import { checkAbuse } from "../services/abuse-protection";
import { notifySubmission, sendContactReceipt } from "../services/notification";

function assertSameContact(stored: unknown, incoming: ContactData) {
  const fields = ["name", "email", "subject", "message", "consent"] as const;
  if (!stored || typeof stored !== "object" || fields.some((field) =>
    (stored as Partial<ContactData>)[field] !== incoming[field])) {
    throw new ORPCError("CONFLICT", {
      message: "Cette référence de soumission ne peut pas être réutilisée pour une demande différente.",
    });
  }
}

export const submissions = {
  configuration: base.handler(() => ({
    demo: !submissionEnabled("project"),
    projectEnabled: submissionEnabled("project"),
    contactEnabled: submissionEnabled("contact"),
    authEnabled: authEnabled(),
    notificationsEnabled: process.env.BFI_NOTIFICATIONS_ENABLED === "true",
  })),
  project: base.input(projectRequest).handler(async ({ input }) => {
    await requireCollection();
    const [previous] = await db
      .select({ id: projectSubmissions.id })
      .from(projectSubmissions)
      .where(
        and(
          eq(projectSubmissions.requestId, input.requestId),
          gt(projectSubmissions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (previous) return { id: previous.id, notification: "already-recorded" };
    await checkAbuse(input.data.email, input.website);
    const now = new Date(),
      expiresAt = addCalendarMonth(now),
      id = `BFI-P-${crypto.randomUUID()}`;
    const { name, email, country, sector, amount, currency } = input.data;
    const stored = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(projectSubmissions)
        .values({
          id,
          requestId: input.requestId,
          name,
          email,
          country,
          sector,
          amount,
          currency,
          data: input.data,
          createdAt: now,
          expiresAt,
          noticeVersion: site.noticeVersion,
        })
        .onConflictDoNothing({ target: projectSubmissions.requestId })
        .returning();
      if (!row) {
        const [existing] = await tx
          .select()
          .from(projectSubmissions)
          .where(eq(projectSubmissions.requestId, input.requestId))
          .limit(1);
        if (!existing || existing.expiresAt.getTime() <= Date.now())
          throw new ORPCError("CONFLICT", {
            message: "Cette référence a expiré. Préparez une nouvelle demande.",
          });
        return existing.id;
      }
      await tx.insert(notifications).values({ id, kind: "projet", expiresAt });
      return id;
    });
    let notification = "failed";
    try {
      notification = await notifySubmission(stored);
    } catch {
      /* Recording succeeded; never tell visitor to resubmit. */
    }
    return { id: stored, notification };
  }),
  contact: base.input(contactRequest).handler(async ({ input }) => {
    await requireCollection("contact");
    const [previous] = await db
      .select({ id: contactMessages.id, data: contactMessages.data })
      .from(contactMessages)
      .where(
        and(
          eq(contactMessages.requestId, input.requestId),
          gt(contactMessages.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (previous) {
      assertSameContact(previous.data, input.data);
      return { id: previous.id, notification: "already-recorded" };
    }
    await checkAbuse(input.data.email, input.website);
    const now = new Date(),
      expiresAt = addCalendarMonth(now),
      id = `BFI-C-${crypto.randomUUID()}`;
    const { name, email, subject } = input.data;
    const stored = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(contactMessages)
        .values({
          id,
          requestId: input.requestId,
          name,
          email,
          subject,
          data: input.data,
          createdAt: now,
          expiresAt,
          noticeVersion: site.noticeVersion,
        })
        .onConflictDoNothing({ target: contactMessages.requestId })
        .returning();
      if (!row) {
        const [existing] = await tx
          .select()
          .from(contactMessages)
          .where(eq(contactMessages.requestId, input.requestId))
          .limit(1);
        if (!existing || existing.expiresAt.getTime() <= Date.now())
          throw new ORPCError("CONFLICT", {
            message: "Cette référence a expiré. Préparez une nouvelle demande.",
          });
        assertSameContact(existing.data, input.data);
        return { id: existing.id, created: false };
      }
      await tx.insert(notifications).values({ id, kind: "contact", expiresAt });
      return { id, created: true };
    });
    if (!stored.created) return { id: stored.id, notification: "already-recorded" };
    let notification = "failed";
    try {
      notification = await notifySubmission(stored.id);
    } catch {
      /* DB save succeeded. */
    }
    const receipt = await sendContactReceipt(stored.id);
    return { id: stored.id, notification, receipt };
  }),
};
