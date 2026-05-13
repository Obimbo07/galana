import type { SiteData } from "@/types/site-data";

export function faqAnswer(siteData: SiteData, question: string): string {
  const q = (question || "").toLowerCase();
  for (const item of siteData.faq ?? []) {
    if (item.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return item.answer;
    }
  }
  return "Try keywords like delivery, KEBS, pipes, paving, roof, price, or hours — or use WhatsApp for a human.";
}
