import { z } from "zod";
import { and, eq, gt, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { adminProcedure } from "../middleware/admin";
import { db } from "../database";
import { projectSubmissions, contactMessages, notifications } from "../database/schema";
import { statuses } from "../../shared/submission-schemas";
import { notifySubmission, sendContactReceipt } from "../services/notification";

const key = z.object({ kind: z.enum(["project", "contact"]), id: z.string().max(100) });
export const admin = {
  profile: adminProcedure.handler(({ context }) => ({ email: context.user.email })),
  list: adminProcedure
    .input(
      z.object({
        kind: z.enum(["project", "contact"]),
        status: z.string().default(""),
        page: z.number().int().min(0).max(10000).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const now = new Date();
      if (input.kind === "project")
        return db
          .select({
            id: projectSubmissions.id,
            name: projectSubmissions.name,
            subject: projectSubmissions.sector,
            status: projectSubmissions.status,
            createdAt: projectSubmissions.createdAt,
            expiresAt: projectSubmissions.expiresAt,
          })
          .from(projectSubmissions)
          .where(
            and(
              gt(projectSubmissions.expiresAt, now),
              input.status ? eq(projectSubmissions.status, input.status) : undefined,
            ),
          )
          .orderBy(desc(projectSubmissions.createdAt))
          .limit(20)
          .offset(input.page * 20);
      return db
        .select({
          id: contactMessages.id,
          name: contactMessages.name,
          subject: contactMessages.subject,
          status: contactMessages.status,
          createdAt: contactMessages.createdAt,
          expiresAt: contactMessages.expiresAt,
        })
        .from(contactMessages)
        .where(
          and(
            gt(contactMessages.expiresAt, now),
            input.status ? eq(contactMessages.status, input.status) : undefined,
          ),
        )
        .orderBy(desc(contactMessages.createdAt))
        .limit(20)
        .offset(input.page * 20);
    }),
  detail: adminProcedure.input(key).handler(async ({ input }) => {
    const table = input.kind === "project" ? projectSubmissions : contactMessages;
    const [row] = await db
      .select()
      .from(table)
      .where(and(eq(table.id, input.id), gt(table.expiresAt, new Date())))
      .limit(1);
    if (!row) throw new ORPCError("NOT_FOUND");
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, input.id))
      .limit(1);
    return { ...row, notification: notification?.state ?? "disabled" };
  }),
  update: adminProcedure
    .input(key.extend({ status: z.enum(statuses) }))
    .handler(async ({ input }) => {
      const table = input.kind === "project" ? projectSubmissions : contactMessages;
      const [row] = await db
        .update(table)
        .set({ status: input.status })
        .where(and(eq(table.id, input.id), gt(table.expiresAt, new Date())))
        .returning({ id: table.id });
      if (!row) throw new ORPCError("NOT_FOUND");
      return row;
    }),
  retryNotification: adminProcedure.input(key).handler(async ({ input }) => {
    const table = input.kind === "project" ? projectSubmissions : contactMessages;
    const [row] = await db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.id, input.id), gt(table.expiresAt, new Date())))
      .limit(1);
    if (!row) throw new ORPCError("NOT_FOUND");
    const state = await notifySubmission(row.id);
    const receipt = input.kind === "contact" ? await sendContactReceipt(row.id) : undefined;
    return { state, receipt };
  }),
};
