import type { SiteData } from "@/types/site-data";

export type ServiceItem = SiteData["services"][number];

/** Fallback visuals when `services[].image` is omitted. */
export const serviceAccentSrc: Record<string, string> = {
  "01": "/images/wallpapers/concrete-pipes.png",
  "02": "/images/wallpapers/custom-designs.png",
  "03": "/images/wallpapers/site-assesment.jpeg",
  "04": "/images/wallpapers/tracked-delievery.jpeg",
  "05": "/images/wallpapers/contractor.jpeg",
  "06": "/images/wallpapers/connector-network.jpeg",
};

const neutralServicePlaceholder = "/images/wallpapers/custom-designs.png";

export function normalizePublicImageSrc(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return t.startsWith("/") ? t : `/${t}`;
}

export function resolveServiceImageSrc(service: ServiceItem): string | null {
  return (
    normalizePublicImageSrc(service.image) ??
    normalizePublicImageSrc(serviceAccentSrc[service.num]) ??
    normalizePublicImageSrc(neutralServicePlaceholder)
  );
}
