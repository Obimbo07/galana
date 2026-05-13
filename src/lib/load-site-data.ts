import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SiteData } from "@/types/site-data";

export function loadSiteData(): SiteData {
  const path = join(process.cwd(), "public/data/data.json");
  return JSON.parse(readFileSync(path, "utf8")) as SiteData;
}
