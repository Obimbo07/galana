import { NextResponse } from "next/server";
import { loadSiteData } from "@/lib/load-site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = loadSiteData();
  return NextResponse.json(
    {
      products: data.products.map((p) => ({
        id: p.id,
        name: p.name,
        cat: p.cat,
        catLabel: p.catLabel,
        use: p.use,
        image: p.image,
        price: p.price,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    }
  );
}
