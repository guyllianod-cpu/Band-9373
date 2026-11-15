import { lte } from "drizzle-orm";
import { db } from "../database";
import {
  projectSubmissions,
  contactMessages,
  notifications,
  abuseBuckets,
  maintenance,
  emailDeliveries,
} from "../database/schema";

export function addCalendarMonth(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);
  const last = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, last));
  return result;
}
export async function purgeExpired(now = new Date()) {
  await db.transaction(async (tx) => {
    await tx.delete(emailDeliveries).where(lte(emailDeliveries.expiresAt, now));
    await tx.delete(notifications).where(lte(notifications.expiresAt, now));
    await tx.delete(projectSubmissions).where(lte(projectSubmissions.expiresAt, now));
    await tx.delete(contactMessages).where(lte(contactMessages.expiresAt, now));
    await tx.delete(abuseBuckets).where(lte(abuseBuckets.expiresAt, now));
    await tx
      .insert(maintenance)
      .values({ key: "purge", completedAt: now })
      .onConflictDoUpdate({ target: maintenance.key, set: { completedAt: now } });
  });
}
