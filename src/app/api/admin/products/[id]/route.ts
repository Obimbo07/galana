import { NextRequest, NextResponse } from "next/server";
import { requireAdminStaff } from "@/lib/admin-api-auth";
import { loadData, saveData } from "@/lib/data-utils";
import type { SiteData } from "@/types/site-data";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminStaff(request);
    const { id } = await context.params;
    const { price } = await request.json();

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    const data = loadData();
    const productIndex = data.products.findIndex((p: SiteData['products'][number]) => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    data.products[productIndex].price = price;
    saveData(data);

    return NextResponse.json(data.products[productIndex]);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}