import { Resend } from "resend";
import { publicSiteOrigin } from "../../shared/seo-config";

// Sender authorization and website links are separate policies, even when
// their domains currently happen to be identical.
export const emailSender = "BAND FINVEST <contact@bfinanceinvest.com>";
export const emailDomain = "bfinanceinvest.com";

export function emailEnabled() {
  return process.env.BFI_NOTIFICATIONS_ENABLED === "true" && process.env.BFI_AUTH_ENABLED === "true";
}

// Explicitly confirmed public URL, not an automatically generated preview origin.
export function emailPublicURL() {
  const url = new URL(process.env.BFI_EMAIL_PUBLIC_URL || "https://invalid.invalid");
  const authURL = new URL(process.env.WEBSITE_URL || "https://invalid.invalid");
  if (
    !process.env.BFI_EMAIL_PUBLIC_URL ||
    url.protocol !== "https:" ||
    url.origin !== publicSiteOrigin ||
    url.username || url.password || url.port || url.search || url.hash || url.pathname !== "/" ||
    authURL.origin !== url.origin
  ) throw new Error("URL publique des e-mails non confirmée ou différente de Better Auth.");
  return url;
}

export function emailLink(path: string) {
  return new URL(path, emailPublicURL()).toString();
}

export function verificationLink(value: string) {
  const base = emailPublicURL();
  const url = new URL(value);
  if (url.origin !== base.origin || url.pathname !== "/api/auth/verify-email" ||
      url.username || url.password || !url.searchParams.get("token")) {
    throw new Error("Lien de vérification non autorisé.");
  }
  const callback = url.searchParams.get("callbackURL");
  if (callback && new URL(callback, base).origin !== base.origin) {
    throw new Error("Retour de vérification non autorisé.");
  }
  return url.toString();
}

// No manual "verified" switch: require authoritative, fresh Resend evidence.
export async function assertEmailDomain() {
  if (!process.env.RESEND_DOMAIN_API_KEY) throw new Error("Clé de lecture des domaines manquante.");
  const client = new Resend(process.env.RESEND_DOMAIN_API_KEY);
  let after: string | undefined;
  for (let page = 0; page < 20; page++) {
    const response = await client.domains.list(
      { limit: 100, ...(after ? { after } : {}) },
      { signal: AbortSignal.timeout(10_000) },
    );
    if (response.error || !response.data) throw new Error("Vérification Resend impossible : envoi bloqué.");
    const found = response.data.data.find((domain) => domain.name.toLowerCase() === emailDomain);
    if (found) {
      if (found.status !== "verified" || found.capabilities?.sending !== "enabled") {
        throw new Error("Le domaine bfinanceinvest.com n’est pas validé pour l’envoi.");
      }
      return { name: emailDomain, status: "verified" as const };
    }
    if (!response.data.has_more || !response.data.data.length) break;
    after = response.data.data.at(-1)!.id;
  }
  throw new Error("Domaine bfinanceinvest.com introuvable : envoi bloqué.");
}

export async function emailClient() {
  if (!emailEnabled()) throw new Error("Notifications réelles désactivées.");
  if (!process.env.RESEND_API_KEY || process.env.BFI_EMAIL_FROM !== emailSender) {
    throw new Error("Clé d’envoi ou expéditeur non configuré.");
  }
  emailPublicURL();
  await assertEmailDomain();
  return new Resend(process.env.RESEND_API_KEY);
}