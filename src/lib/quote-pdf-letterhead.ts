import type { SiteData } from "@/types/site-data";

export interface QuotePdfLetterhead {
  logoDataUri?: string;
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  altPhone?: string;
  email: string;
  quoteEmail: string;
  hours: string;
}

export function buildLetterheadFromSiteData(
  data: SiteData,
  logoDataUri?: string
): QuotePdfLetterhead {
  const c = data.contact;
  return {
    logoDataUri,
    companyName: "Galana Group",
    tagline: data.footer?.tagline || "At Galana You Dream We Deliver",
    address: c.location,
    phone: c.phoneDisplay,
    altPhone: c.altPhoneDisplay?.trim()
      ? `${c.altPhoneDisplay} ${c.altPhoneTel ? `(${c.altPhoneTel})` : ""}`.trim()
      : undefined,
    email: c.infoEmail,
    quoteEmail: c.quoteEmail,
    hours: c.operatingHours,
  };
}
