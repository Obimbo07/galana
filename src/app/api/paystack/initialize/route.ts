import { NextResponse } from "next/server";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import { FieldValue } from "firebase-admin/firestore";
import { resolvePublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export async function POST(request: Request) {
  try {
    let body: { email?: unknown; quoteId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const emailRaw =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!emailRaw || !isLikelyEmail(emailRaw)) {
      return NextResponse.json(
        {
          error:
            "A valid customer email is required for checkout (same as used on your quote, or corrected here).",
        },
        { status: 400 }
      );
    }

    const quoteId =
      typeof body.quoteId === "string" ? body.quoteId.trim() : "";
    if (!quoteId) {
      return NextResponse.json(
        { error: "Quote reference is required" },
        { status: 400 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const db = getGalanaAdminDb();
    const quoteRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(quoteId);
    const quoteSnap = await quoteRef.get();
    if (!quoteSnap.exists) {
      return NextResponse.json(
        { error: "Quote request not found" },
        { status: 404 }
      );
    }
    const q = quoteSnap.data()!;
    if (q.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This quote is already paid." },
        { status: 400 }
      );
    }

    const total =
      typeof q.totalPrice === "number" &&
      Number.isFinite(q.totalPrice) &&
      q.totalPrice > 0
        ? q.totalPrice
        : NaN;
    if (!Number.isFinite(total)) {
      return NextResponse.json(
        { error: "This quote does not have a payable total yet." },
        { status: 400 }
      );
    }

    /** Paystack expects the smallest currency unit (e.g. cents for KES). */
    const amountSubunits = Math.round(total * 100);
    if (amountSubunits <= 0) {
      return NextResponse.json({ error: "Invalid quote amount." }, {
        status: 400,
      });
    }

    const reference =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const currency = process.env.PAYSTACK_CURRENCY?.trim() || "KES";

    const siteOrigin = resolvePublicSiteUrl(request);
    const callbackUrl = siteOrigin
      ? `${siteOrigin}/api/paystack/verify`
      : undefined;

    const initializeUrl = "https://api.paystack.co/transaction/initialize";
    const paystackRes = await fetch(initializeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailRaw,
        amount: amountSubunits,
        reference,
        currency,
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        metadata: { quote_id: quoteId },
      }),
    });

    const paystackResText = await paystackRes.text();
    if (!paystackRes.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = JSON.parse(paystackResText) as Record<string, unknown>;
      } catch {
        errorData = { message: paystackResText.slice(0, 200) };
      }
      const msg =
        (typeof errorData.message === "string" && errorData.message) ||
        "Payment provider rejected the checkout request.";
      console.error("Paystack initialization failed:", errorData);
      return NextResponse.json(
        { error: msg, details: errorData },
        { status: 502 }
      );
    }

    const paystackData = JSON.parse(paystackResText) as {
      status?: unknown;
      data?: { authorization_url?: string };
    };

    if (!paystackData.status || !paystackData.data?.authorization_url) {
      console.error("Invalid response from Paystack:", paystackData);
      return NextResponse.json(
        { error: "Invalid response from payment provider", details: paystackData },
        { status: 502 }
      );
    }

    await quoteRef.update({
      paymentReference: reference,
      paymentStatus: q.paymentStatus === "paid" ? "paid" : "pending",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("[api/paystack/initialize]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
