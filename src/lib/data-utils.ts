import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SiteData } from "@/types/site-data";

const DATA_PATH = join(process.cwd(), "public/data/data.json");

export function loadData(): SiteData {
  const raw = readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw) as SiteData;
}

export function saveData(data: SiteData) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}