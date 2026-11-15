export const publicSiteOrigin = "https://bfinanceinvest.com";

// Explicit allowlist: actual public routes only, never auth, API or 404 fallbacks.
export const publicPagePaths = [
  "/",
  "/nos-services",
  "/notre-demarche",
  "/presenter-un-projet",
  "/a-propos",
  "/contact",
  "/questions-frequentes",
  "/politique-de-confidentialite",
  "/mentions-legales",
] as const;

export function canonicalURL(path: string) {
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  if (!publicPagePaths.some((publicPath) => publicPath === normalized)) return null;
  return new URL(normalized, publicSiteOrigin).href;
}