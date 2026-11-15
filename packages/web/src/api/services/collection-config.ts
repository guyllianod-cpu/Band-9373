import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { site } from "../../shared/site-config";
import { db } from "../database";
import { maintenance } from "../database/schema";

export function authEnabled() {
  return process.env.BFI_AUTH_ENABLED === "true";
}
export function collectionEnabled() {
  return (
    process.env.BFI_COLLECTION_ENABLED === "true" &&
    process.env.BFI_LEGAL_APPROVED === "true" &&
    process.env.BFI_RETENTION_READY === "true" &&
    authEnabled() &&
    [site.legalName, site.address, site.publisher, site.hosting].every(Boolean)
  );
}
export function adminAllowed(user: { email: string; emailVerified: boolean } | null | undefined) {
  return !!user && user.emailVerified === true && user.email.toLowerCase() === site.adminEmail;
}
// Separate, fail-closed permissions: opening contact never opens project intake.
export function submissionEnabled(kind: "project" | "contact") {
  const permission = kind === "contact" ? "BFI_CONTACT_ENABLED" : "BFI_PROJECT_ENABLED";
  return collectionEnabled() && process.env[permission] === "true";
}
export async function requireCollection(kind: "project" | "contact" = "project") {
  if (!submissionEnabled(kind))
    throw new ORPCError("FORBIDDEN", {
      message: "La réception de ce formulaire n’est pas activée. Aucune demande ne peut être transmise.",
    });
  const [run] = await db.select().from(maintenance).where(eq(maintenance.key, "purge")).limit(1);
  if (!run || Date.now() - run.completedAt.getTime() > 26 * 3600_000)
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "La réception est temporairement indisponible. Réessayez ultérieurement.",
    });
}
