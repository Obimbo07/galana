import { NextResponse } from "next/server";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { quoteTrackingSummary } from "@/lib/quote-tracking";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import type { QuoteRequest } from "@/types/galana-firestore";
import { quoteRequestFromDoc as toQuote } from "@/lib/quote-request-document";

export const dynamic = "force-dynamic";

/** Public: safe fields only (no PDF payload internals, no internalNote). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: "Quote reference is required" }, {
        status: 400,
      });
    }
    const db = getGalanaAdminDb();
    const snap = await db.collection(QUOTE_REQUESTS_COLLECTION).doc(id.trim()).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    const raw = snap.data();
    if (!raw) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    const quote: QuoteRequest = toQuote(snap.id, raw);
    const paymentDisplay =
      quote.paymentStatus === "paid"
        ? "Paid"
        : quote.paymentStatus === "failed"
          ? "Payment failed — try again or contact us"
          : "Awaiting payment";

    return NextResponse.json({
      id: quote.id,
      kind: quote.kind,
      status: quote.status,
      paymentStatus: quote.paymentStatus ?? "pending",
      paymentLabel: paymentDisplay,
      totalPrice: quote.totalPrice ?? null,
      /** Delivery-related address from submission (same as used on your quote request). */
      deliveryLocation:
        quote.customerLocation?.trim() ||
        quote.payload.location?.trim() ||
        null,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      summary: quoteTrackingSummary(quote),
    });
  } catch (e: unknown) {
    console.error("[api/track/quote/[id]]", e);
    return NextResponse.json(
      { error: "Could not load quote status" },
      { status: 500 }
    );
  }
}
