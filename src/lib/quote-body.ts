import type { CalcFields, CalcTab } from "@/lib/calculator-math";
import { computePaving, computePipes, computeRoof } from "@/lib/calculator-math";

export interface CartPayloadLine {
  productId: string;
  name: string;
  category: string;
  qty: number;
  lineNote: string;
}

export function getCalcLinesForQuote(fields: CalcFields, activeMainTab: CalcTab) {
  const lines: string[] = [];
  const pav = computePaving(fields);
  if (pav) lines.push(`[Paving] ${pav.value} — ${pav.note}`);
  const pipe = computePipes(fields);
  if (pipe) lines.push(`[Drainage pipes] ${pipe.value} — ${pipe.note}`);
  const roof = computeRoof(fields);
  if (roof) lines.push(`[Roof tiles] ${roof.value} — ${roof.note}`);
  const activeLabel =
    activeMainTab === "paving"
      ? "Paving (primary tab)"
      : activeMainTab === "pipes"
        ? "Pipes (primary tab)"
        : "Roofing (primary tab)";
  return { lines, activeLabel };
}

export function buildQuoteBody(params: {
  pageUrl: string;
  email: string;
  phone?: string;
  location?: string;
  fullName?: string;
  company?: string;
  fields: CalcFields;
  activeMainTab: CalcTab;
  cart: CartPayloadLine[];
}) {
  const { lines, activeLabel } = getCalcLinesForQuote(params.fields, params.activeMainTab);
  const contactBits = [
    params.fullName?.trim() && `Name: ${params.fullName.trim()}`,
    params.company?.trim() && `Company: ${params.company.trim()}`,
    `Email: ${params.email || "(not provided)"}`,
    params.phone?.trim() && `Phone: ${params.phone.trim()}`,
    params.location?.trim() && `Location: ${params.location.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
  const header = `Quote request — Galana Group\nPage: ${params.pageUrl}\n\n${contactBits}\n`;
  const calcBlock = lines.length
    ? `\n--- Materials calculator ---\nPrimary section tab: ${activeLabel}\n${lines.join("\n")}\n`
    : "\n--- Materials calculator ---\n(no quantities entered yet)\n";
  let cartBlock = "\n--- Cart ---\n";
  if (!params.cart.length) cartBlock += "(empty)\n";
  else {
    cartBlock +=
      params.cart
        .map(
          (c) =>
            `• ${c.name} × ${c.qty}${c.lineNote ? ` — note: ${c.lineNote}` : ""}`
        )
        .join("\n") + "\n";
  }
  return header + calcBlock + cartBlock + "\n--- End ---\n";
}
