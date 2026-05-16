import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SITE_LOGO_LOCAL_BASENAME,
  SITE_LOGO_LOCAL_FALLBACK_BASENAMES,
} from "@/lib/site-brand";

const CANDIDATES = [
  SITE_LOGO_LOCAL_BASENAME,
  ...SITE_LOGO_LOCAL_FALLBACK_BASENAMES,
] as const;

/** Base64 data URI for the canonical site logo under `public/images/`, if present. */
export function loadGalanaLogoDataUri(): string | undefined {
  const base = join(process.cwd(), "public", "images");
  for (const name of CANDIDATES) {
    const p = join(base, name);
    if (!existsSync(p)) continue;
    const buf = readFileSync(p);
    const mime =
      name.endsWith(".png") ? "image/png" : name.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  }
  return undefined;
}
