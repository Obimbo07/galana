import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loadSiteData } from "@/lib/load-site-data";

export const dynamic = "force-dynamic";

const VALID_CATS = new Set([
  "pipes",
  "precast",
  "paving",
  "roofing",
  "vent",
  "sinks",
]);

export async function GET(request: NextRequest) {
  const cat = request.nextUrl.searchParams.get("cat");
  const data = loadSiteData();
  let products = data.products;

  if (cat && cat !== "all" && VALID_CATS.has(cat)) {
    products = products.filter((p) => p.cat === cat);
  }

  return NextResponse.json(
    {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        cat: p.cat,
        catLabel: p.catLabel,
        use: p.use,
        image: p.image,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        referenceUrl: p.referenceUrl,
        listingNote: p.listingNote,
        badge: p.badge,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    }
  );
}
