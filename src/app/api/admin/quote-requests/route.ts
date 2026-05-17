import { NextResponse } from "next/server";
import { AdminApiError, requireAdminStaff } from "@/lib/admin-api-auth";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { quoteRequestFromDoc } from "@/lib/quote-request-document";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import type { QuoteRequest } from "@/types/galana-firestore";

export async function GET(req: Request) {
  try {
    await requireAdminStaff(req);
    const url = new URL(req.url);
    const limitRaw = url.searchParams.get("limit");
    const limit = Math.min(
      80,
      Math.max(1, parseInt(limitRaw || "40", 10) || 40)
    );

    const db = getGalanaAdminDb();
    const q = await db
      .collection(QUOTE_REQUESTS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items: QuoteRequest[] = q.docs.map((doc) =>
      quoteRequestFromDoc(doc.id, doc.data())
    );
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return NextResponse.json({ ok: false, message: e.message }, {
        status: e.status,
      });
    }
    console.error("[api/admin/quote-requests]", e);
    return NextResponse.json({ ok: false, message: "Firestore error" }, {
      status: 500,
    });
  }
}
