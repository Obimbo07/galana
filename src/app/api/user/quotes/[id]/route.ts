import { NextRequest, NextResponse } from "next/server";
import { getGalanaAdminAuth, getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import { quoteRequestFromDoc as toQuote } from "@/lib/quote-request-document";
import { quoteTrackingSummary } from "@/lib/quote-tracking";
import type { QuoteRequest } from "@/types/galana-firestore";

export const dynamic = "force-dynamic";

function ownsQuote(
  quote: QuoteRequest,
  uid: string,
  userEmail: string | undefined
): boolean {
  if (quote.userId && quote.userId === uid) return true;
  if (userEmail && quote.fromEmail && quote.fromEmail === userEmail) return true;
  return false;
}

/** Authenticated view of one quote (same safe payload shape as public track API). */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getGalanaAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const userEmail = decoded.email;

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
    if (!ownsQuote(quote, uid, userEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      deliveryLocation:
        quote.customerLocation?.trim() ||
        quote.payload.location?.trim() ||
        null,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      summary: quoteTrackingSummary(quote),
    });
  } catch (e: unknown) {
    console.error("[api/user/quotes/[id]]", e);
    return NextResponse.json(
      { error: "Could not load quote" },
      { status: 500 }
    );
  }
}
