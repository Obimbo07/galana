/**
 * Merge public/data/products-reference-extension.json into data.json files.
 * Skips entries whose id already exists (never replaces Galana catalogue rows).
 *
 * Usage: node scripts/merge-reference-catalog.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const extensionPath = join(root, "public/data/products-reference-extension.json");
const publicDataPath = join(root, "public/data/data.json");
const legacyDataPath = join(root, "data/data.json");

const extension = JSON.parse(readFileSync(extensionPath, "utf8"));
const data = JSON.parse(readFileSync(publicDataPath, "utf8"));

const existingIds = new Set((data.products ?? []).map((p) => p.id));
let added = 0;
for (const row of extension) {
  if (!row?.id || existingIds.has(row.id)) continue;
  data.products.push(row);
  existingIds.add(row.id);
  added++;
}

writeFileSync(publicDataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
writeFileSync(legacyDataPath, JSON.stringify(data, null, 2) + "\n", "utf8");

console.log(`Merged reference catalogue: +${added} products (skipped duplicates).`);
console.log(
  "Next: npm run download-product-images — saves remote product.image URLs under public/images/products/."
);
