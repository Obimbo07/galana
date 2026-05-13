export type CalcTab = "paving" | "pipes" | "roofing";

export interface CalcFields {
  pavingLength: string;
  pavingWidth: string;
  pavingBlocksPerM2: number;
  pavingWaste: string;
  pipeLength: string;
  pipeSectionM: number;
  pipeExtra: string;
  roofArea: string;
  roofTilesPerM2: number;
  roofWaste: string;
}

export function computePaving(f: CalcFields) {
  const l = parseFloat(f.pavingLength) || 0;
  const w = parseFloat(f.pavingWidth) || 0;
  const t = f.pavingBlocksPerM2 || 40;
  const waste = parseFloat(f.pavingWaste) || 10;
  const area = l * w;
  if (!area) return null;
  const base = Math.ceil(area * t);
  const total = Math.ceil(base * (1 + waste / 100));
  const note = `Area: ${area.toFixed(1)}m² × ${t} blocks/m² + ${waste}% wastage buffer. Always verify on site.`;
  return {
    value: `${total.toLocaleString()} blocks`,
    note,
  };
}

export function computePipes(f: CalcFields) {
  const len = parseFloat(f.pipeLength) || 0;
  const sec = f.pipeSectionM || 2.5;
  const extra = parseFloat(f.pipeExtra) || 5;
  if (!len) return null;
  const base = Math.ceil(len / sec);
  const total = Math.ceil(base * (1 + extra / 100));
  const note = `${len}m ÷ ${sec}m sections + ${extra}% for joints & cuts. Consult our engineers for complex networks.`;
  return {
    value: `${total.toLocaleString()} sections`,
    note,
  };
}

export function computeRoof(f: CalcFields) {
  const area = parseFloat(f.roofArea) || 0;
  const t = f.roofTilesPerM2 || 12;
  const waste = parseFloat(f.roofWaste) || 10;
  if (!area) return null;
  const base = Math.ceil(area * t);
  const total = Math.ceil(base * (1 + waste / 100));
  const note = `${area}m² × ${t} tiles/m² + ${waste}% for cuts & breakages. Ridge tiles calculated separately.`;
  return {
    value: `${total.toLocaleString()} tiles`,
    note,
  };
}
