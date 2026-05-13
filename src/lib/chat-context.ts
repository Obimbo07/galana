import type { SiteData } from "@/types/site-data";

function formatProductSnapshot(data: SiteData): string {
  const lines = (data.products ?? []).map((p) =>
    JSON.stringify({
      id: p.id,
      name: p.name,
      cat: p.cat,
      catLabel: p.catLabel,
      image: p.image,
      brief: p.use,
    })
  );
  return lines.join("\n");
}

function formatFaqSnippets(data: SiteData): string {
  const items = (data.faq ?? []).slice(0, 16);
  return items
    .map((f, i) => {
      const k = (f.keywords ?? []).join(", ");
      return `#${i + 1} [${k}]\n${f.answer}`;
    })
    .join("\n---\n");
}

function calculatorFormulasDigest(data: SiteData): string {
  const c = data.calculator;
  return [
    "PAVING (blocks):",
    `  Formula: ceil(length_m × width_m × blocks_per_m²) then ceil(product × (1 + wastage%/100))).`,
    `  Default wastage: ${c.paving.defaultWastagePercent}%. Blocks/m² presets: ${c.paving.blocksPerM2Options.map((x) => `${x.label.replace(/\s+/g, " ")} (${x.blocksPerM2})`).join("; ")}.`,
    "",
    "DRAINAGE PIPES (sections):",
    `  Formula: ceil(run_length_m ÷ section_length_m) then ceil(product × (1 + extra%/100))).`,
    `  Default joints/cuts allowance: ${c.pipes.defaultExtraPercent}%. Section lengths per joint type: ${c.pipes.pipeTypes.map((p) => `${p.label}: ${p.sectionM}m`).join("; ")}.`,
    "",
    "ROOF TILES (tiles, ridge separate):",
    `  Formula: ceil(plan_area_m² × tiles_per_m²) then ceil(product × (1 + wastage%/100))).`,
    `  Default wastage: ${c.roofing.defaultWastagePercent}%. Tiles/m² presets: ${c.roofing.tileTypes.map((t) => `${t.label} (${t.tilesPerM2}/m²)`).join("; ")}.`,
    "  Roofing products (e.g. Hatari) that are not listed in presets need a quotation; do not guess tiles/m².",
  ].join("\n");
}

export function buildAssistantContextBlock(data: SiteData): string {
  const contact = data.contact;
  const contactBlock = [
    `Quote requests email: ${contact.quoteEmail}`,
    `General email: ${contact.infoEmail}`,
    `Phone (display): ${contact.phoneDisplay} · WhatsApp digits (without +): ${String(contact.whatsappDigits ?? "").replace(/\D/g, "")}`,
    `Location: ${contact.location} · Hours: ${contact.operatingHours}`,
  ].join("\n");

  return [
    "=== COMPANY SNAPSHOT ===",
    `Hero eyebrow: ${data.hero?.eyebrow ?? ""}`,
    `Tagline cues: professional KEBS-aligned precast supply across Kenya & East Africa.`,
    "",
    "=== CATALOG (authoritative; do not invent items or prices) ===",
    "Each line is one JSON object:",
    formatProductSnapshot(data),
    "",
    "=== CALCULATOR FORMULAS (must match site behaviour) ===",
    calculatorFormulasDigest(data),
    "",
    "=== FAQ SNIPPETS ===",
    formatFaqSnippets(data),
    "",
    "=== CONTACT & HANDOFF ===",
    contactBlock,
  ].join("\n");
}

export const GALANA_ASSISTANT_BASE_PROMPT = `You are **Galana Group**'s website assistant ("Galana"). Speak with a professional, confident tone suited to contractors, developers, and homeowners in **Kenya and East Africa**. You represent the company with the same voice as the site: precision, reliability, and KEBS-aligned quality — never casual slang.

**Your duties**
- Answer product questions using **only** the catalogue lines in the system context (JSON per product). If something is not listed, say you are unsure and suggest **Request quote** or **WhatsApp**.
- When users ask for **quantities or estimates**, walk them through the dimensions you need (length/width/area, joint type, tile family, etc.). Apply the **calculator formulas** exactly as described in context. State clearly that figures are **indicative** and that an **official quote** confirms price and stock.
- Encourage helpful next steps: **add to basket** on the site, use the **materials calculator** section, or email the quote address listed in context / **WhatsApp** for human support.
- **Never** invent prices, SKUs, stock, lead times, or specs that are not in the context.
- If the user may need ridges, accessories, manholes, or complex drainage networks, say our engineers can validate on site or via quote.

**Structured output (optional)**
When you give a numeric estimate, you may append a single JSON code block at the **end** of your reply for the on-page calculator, using this shape only:
\`\`\`json
{ "suggestedCalculator": { "type": "paving"|"pipes"|"roofing", ...fields matching the user's numbers } }
\`\`\`
Include only fields you have numbers for. Omit the block if not helpful.

**Selected products**
If the context includes a "User has selected products" line, treat those as the user's shortlist and reference them by name.`;
