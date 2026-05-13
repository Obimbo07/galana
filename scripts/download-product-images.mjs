/**
 * Downloads remote product images into public/images/products/
 * Rewrites product.image to /images/products/<id>.<ext>
 * Writes merged JSON to public/data/data.json (canonical).
 */
import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const jsonPath = join(root, "data", "data.json");
const outDir = join(root, "public", "images", "products");
const outJson = join(root, "public", "data", "data.json");

function extFromUrl(url, contentType) {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".gif")) return "gif";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return "jpg";
  return "jpg";
}

async function download(url, destPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const body = Readable.fromWeb(res.body);
  await pipeline(body, createWriteStream(destPath));
  return res.headers.get("content-type") ?? "";
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(dirname(outJson), { recursive: true });

  const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
  const failures = [];

  for (const p of raw.products ?? []) {
    const url = p.image;
    if (!url || typeof url !== "string") continue;
    if (url.startsWith("/")) continue;

    let ext = extFromUrl(url, "");
    const dest = join(outDir, `${p.id}.${ext}`);
    try {
      await download(url, dest);
      p.image = `/images/products/${p.id}.${ext}`;
    } catch (e) {
      failures.push({ id: p.id, url, error: String(e?.message ?? e) });
    }
  }

  const jsonOut = JSON.stringify(raw, null, 2) + "\n";
  writeFileSync(outJson, jsonOut, "utf8");
  writeFileSync(jsonPath, jsonOut, "utf8");
  console.log(
    JSON.stringify(
      {
        wrote: outJson,
        imagesDir: outDir,
        downloaded: (raw.products ?? []).filter((x) =>
          String(x.image ?? "").startsWith("/images/products/")
        ).length,
        failures,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
