/**
 * Canonical public origin for redirects and payment callbacks.
 * Prefer NEXT_PUBLIC_SITE_URL in production when the app sits behind proxies.
 */
export function resolvePublicSiteUrl(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      /* ignore */
    }
  }
  return "";
}
