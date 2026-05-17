import { NextResponse } from "next/server";
import { requireAdminStaff, AdminApiError } from "@/lib/admin-api-auth";
import { loadData, saveData } from "@/lib/data-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminStaff(request);
    const data = loadData();
    return NextResponse.json({ calculator: data.calculator });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminStaff(request);
    const { calculator } = await request.json();

    // Basic validation: check that calculator is an object and has the expected structure?
    // We'll do a light validation: ensure it's an object and has the three keys.
    if (
      !calculator ||
      typeof calculator !== "object" ||
      !calculator.paving ||
      !calculator.pipes ||
      !calculator.roofing
    ) {
      return NextResponse.json(
        { error: "Invalid calculator settings structure" },
        { status: 400 }
      );
    }

    const data = loadData();
    data.calculator = calculator;
    saveData(data);

    return NextResponse.json({ calculator: data.calculator });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}