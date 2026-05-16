"use client";

import Image from "next/image";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-brand";

export type SiteLogoProps = {
  priority?: boolean;
  heightPx: number;
  className?: string;
};

export function SiteLogo({ priority, heightPx, className }: SiteLogoProps) {
  return (
    <Image
      src={SITE_LOGO_SRC}
      alt={SITE_LOGO_ALT}
      width={180}
      height={180}
      className={className}
      priority={priority}
      style={{ height: heightPx, width: "auto" }}
    />
  );
}
