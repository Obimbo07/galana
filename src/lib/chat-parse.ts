import type {
  SuggestedCalculatorPayload,
  SuggestedCalculatorType,
} from "@/types/chat";

const CALC_TYPES: SuggestedCalculatorType[] = ["paving", "pipes", "roofing"];

function isCalcType(v: unknown): v is SuggestedCalculatorType {
  return typeof v === "string" && (CALC_TYPES as string[]).includes(v);
}

export function extractSuggestedCalculator(
  text: string
): SuggestedCalculatorPayload | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (!fence) return null;
  try {
    const o = JSON.parse(fence[1].trim()) as Record<string, unknown>;
    const raw = o.suggestedCalculator;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const sc = raw as Record<string, unknown>;
    if (!isCalcType(sc.type)) return null;
    return {
      type: sc.type,
      pavingLength: readStr(sc.pavingLength),
      pavingWidth: readStr(sc.pavingWidth),
      pavingBlocksPerM2: readNum(sc.pavingBlocksPerM2),
      pavingWastagePercent: readNum(sc.pavingWastagePercent),
      pipeLength: readStr(sc.pipeLength),
      pipeSectionM: readNum(sc.pipeSectionM),
      pipeExtraPercent: readNum(sc.pipeExtraPercent),
      roofArea: readStr(sc.roofArea),
      roofTilesPerM2: readNum(sc.roofTilesPerM2),
      roofWastagePercent: readNum(sc.roofWastePercent ?? sc.roofWastagePercent),
    };
  } catch {
    return null;
  }
}

function readStr(v: unknown): string | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined;
  return v.trim();
}

function readNum(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function findMentionedProductIds(
  text: string,
  products: ReadonlyArray<{ id: string; name: string }>
): string[] {
  const low = text.toLowerCase();
  const hits: string[] = [];
  for (const p of products) {
    const n = p.name.toLowerCase();
    if (n.length >= 3 && low.includes(n)) hits.push(p.id);
  }
  return [...new Set(hits)];
}
