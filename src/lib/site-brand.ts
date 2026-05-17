/** Canonical site logo — keep in sync everywhere (navbar, footer, PDF letterhead). */
export const SITE_LOGO_ALT = "Galana Group";

/** Square mark — `public/images/logo-final.png` */
export const SITE_LOGO_SRC = "/images/logo-final.png" as const;

/** Horizontal wordmark — `public/images/logo-name.png` */
export const SITE_LOGO_NAME_SRC = "/images/logo-name.png" as const;


/** Filename under `public/images/` for server-side loading (e.g. quote PDF). */
export const SITE_LOGO_LOCAL_BASENAME = "logo-final.png" as const;

export const SITE_LOGO_LOCAL_FALLBACK_BASENAMES = [
  "logo-final.jpg",
  "logo-final.png",
  "logo-final.webp",
] as const;
