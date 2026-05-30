export type TrustedPartner = {
  id: string;
  name: string;
  logo: string;
  /** Optional link to the organisation site */
  href?: string;
};

/** Kenyan construction, infrastructure and standards partners shown in the marquee. */
export const TRUSTED_PARTNERS: TrustedPartner[] = [
  {
    id: "kebs",
    name: "Kenya Bureau of Standards",
    logo: "/images/trusted-by/kebs.svg",
    href: "https://www.kebs.org",
  },
  {
    id: "nca",
    name: "National Construction Authority",
    logo: "/images/trusted-by/nca.svg",
    href: "https://nca.go.ke",
  },
  {
    id: "kenha",
    name: "Kenya National Highways Authority",
    logo: "/images/trusted-by/kenha.svg",
    href: "https://kenha.co.ke",
  },
  {
    id: "kura",
    name: "Kenya Urban Roads Authority",
    logo: "/images/trusted-by/kura.svg",
    href: "https://kura.go.ke",
  },
  {
    id: "nema",
    name: "National Environment Management Authority",
    logo: "/images/trusted-by/nema.svg",
    href: "https://www.nema.go.ke",
  },
  {
    id: "nhc",
    name: "National Housing Corporation",
    logo: "/images/trusted-by/nhc.svg",
    href: "https://www.nhc.co.ke",
  },
  {
    id: "nairobi",
    name: "Nairobi City County",
    logo: "/images/trusted-by/nairobi-county.svg",
    href: "https://nairobi.go.ke",
  },
  {
    id: "kenya-power",
    name: "Kenya Power",
    logo: "/images/trusted-by/kenya-power.svg",
    href: "https://www.kplc.co.ke",
  },
  {
    id: "kenya-railways",
    name: "Kenya Railways",
    logo: "/images/trusted-by/kenya-railways.svg",
    href: "https://krc.co.ke",
  },
  {
    id: "bamburi",
    name: "Bamburi Cement",
    logo: "/images/trusted-by/bamburi.svg",
    href: "https://www.lafarge.co.ke",
  },
];
