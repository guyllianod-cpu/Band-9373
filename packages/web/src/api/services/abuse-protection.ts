import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "../database";
import { abuseBuckets } from "../database/schema";

export async function checkAbuse(email: string, website: string) {
  if (website) throw new ORPCError("BAD_REQUEST", { message: "Demande refusée." });
  const bucket = Math.floor(Date.now() / 3600_000);
  const emailHash = createHmac("sha256", process.env.BETTER_AUTH_SECRET!)
    .update(email.toLowerCase())
    .digest("hex");
  for (const [label, limit] of [
    [emailHash, 5],
    ["global", 100],
  ] as const) {
    const [row] = await db
      .insert(abuseBuckets)
      .values({ key: `${bucket}:${label}`, hits: 1, expiresAt: new Date((bucket + 2) * 3600_000) })
      .onConflictDoUpdate({ target: abuseBuckets.key, set: { hits: sql`${abuseBuckets.hits}+1` } })
      .returning();
    if (row.hits > limit)
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "Trop de demandes. Réessayez plus tard.",
      });
  }
}
