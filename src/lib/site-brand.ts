/** Canonical site logo — keep in sync everywhere (navbar, footer, PDF letterhead). */
export const SITE_LOGO_ALT = "Galana Group";

export const SITE_LOGO_SRC = "/images/logo2.png" as const;

/** Filename under `public/images/` for server-side loading (e.g. quote PDF). */
export const SITE_LOGO_LOCAL_BASENAME = "logo2.png" as const;

export const SITE_LOGO_LOCAL_FALLBACK_BASENAMES = [
  "logo.jpg",
  "logo.png",
  "logo.webp",
] as const;
