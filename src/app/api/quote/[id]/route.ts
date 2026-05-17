import { NextResponse } from "next/server";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import type { QuoteRequest } from "@/types/galana-firestore";
import { quoteRequestFromDoc as toQuote } from "@/lib/quote-request-document";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getGalanaAdminDb();
    const snap = await db.collection(QUOTE_REQUESTS_COLLECTION).doc(id).get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Quote request not found" },
        { status: 404 }
      );
    }
    const data = snap.data();
    if (!data) {
      return NextResponse.json(
        { error: "Quote request not found" },
        { status: 404 }
      );
    }
    const quote: QuoteRequest = toQuote(id, data);
    // Return only necessary fields for payment
    return NextResponse.json({
      id: quote.id,
      totalPrice: quote.totalPrice,
      paymentStatus: quote.paymentStatus,
      fromEmail: quote.fromEmail,
      // We don't need to return more
    });
  } catch (error: unknown) {
    console.error("[api/quote/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}