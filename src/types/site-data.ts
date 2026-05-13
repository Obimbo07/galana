export interface SiteData {
  branding?: {
    logo?: { source?: string; note?: string };
  };
  hero: {
    eyebrow: string;
    titleLines: string[];
    titleItalicIndex: number;
    sub: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    stats: Array<{ num: string; label: string; dataTarget?: number }>;
    diffBand: string[];
  };
  services: Array<{
    num: string;
    icon: string;
    name: string;
    desc: string;
    tag: string;
  }>;
  why: {
    sectionTag: string;
    title: string;
    items: Array<{ icon: string; title: string; body: string }>;
    hexMetrics: Array<{ num: string; label: string }>;
  };
  gallery: unknown[];
  team: unknown[];
  careers: {
    heading: string;
    sub: string;
    openApplicationCta: string;
    jobs: Array<{
      title: string;
      tags: string[];
      modalKey: string;
    }>;
  };
  footer: {
    tagline: string;
    about: string;
    copyright: string;
  };
  contact: {
    quoteEmail: string;
    infoEmail: string;
    phoneDisplay: string;
    phoneTel: string;
    whatsappDigits: string;
    location: string;
    operatingHours: string;
  };
  help: {
    whatsappPrefill: string;
  };
  calculator: {
    paving: {
      defaultWastagePercent: number;
      blocksPerM2Options: Array<{
        id: string;
        label: string;
        blocksPerM2: number;
      }>;
    };
    pipes: {
      defaultExtraPercent: number;
      pipeTypes: Array<{ id: string; label: string; sectionM: number }>;
    };
    roofing: {
      defaultWastagePercent: number;
      tileTypes: Array<{ id: string; label: string; tilesPerM2: number }>;
    };
  };
  products: Array<{
    id: string;
    cat: string;
    catLabel: string;
    name: string;
    use: string;
    image: string;
  }>;
  faq: Array<{ keywords: string[]; answer: string }>;
}
