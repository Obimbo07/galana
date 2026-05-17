import { NextResponse } from "next/server";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import { FieldValue } from "firebase-admin/firestore";
import { resolvePublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference =
      searchParams.get("reference") ?? searchParams.get("trxref");
    // Paystack also sends trxref, but we use our own reference
    if (!reference) {
      return NextResponse.json(
        { error: "Paystack reference is required" },
        { status: 400 }
      );
    }
    // We don't have quoteId in GET, so we need to look it up by reference
    // We stored the reference in the quote request document under paymentReference
    const db = getGalanaAdminDb();
    const quotesCol = db.collection(QUOTE_REQUESTS_COLLECTION);
    const snapshot = await quotesCol.where("paymentReference", "==", reference).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Quote request not found for this reference" },
        { status: 404 }
      );
    }
    const quoteDoc = snapshot.docs[0];
    const quoteId = quoteDoc.id;

    // Verify with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const paystackRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    });

    if (!paystackRes.ok) {
      const errorData = await paystackRes.json();
      console.error("Paystack verification failed:", errorData);
      return NextResponse.json(
        { error: "Failed to verify payment with Paystack" },
        { status: 502 }
      );
    }

    const paystackData = await paystackRes.json();
    if (!paystackData.status || paystackData.data.status !== "success") {
      // Payment not successful
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    // Payment is successful, update the quote request
    const siteBase = resolvePublicSiteUrl(request);
    if (!siteBase) {
      return NextResponse.json(
        {
          error:
            "Set NEXT_PUBLIC_SITE_URL so checkout can redirect here after Paystack confirmation.",
        },
        { status: 500 }
      );
    }

    const quoteRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(quoteId);
    await quoteRef.update({
      paymentStatus: "paid",
      updatedAt: FieldValue.serverTimestamp(),
      // lastUpdatedBy: "paystack_system",
    });

    return NextResponse.redirect(
      `${siteBase.replace(/\/$/, "")}/pay/${encodeURIComponent(
        quoteId
      )}?payment=success`
    );
  } catch (error) {
    console.error("[api/paystack/verify]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { reference, quoteId } = await request.json();

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { error: "Paystack reference is required" },
        { status: 400 }
      );
    }

    if (!quoteId || typeof quoteId !== "string") {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const paystackRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    });

    if (!paystackRes.ok) {
      const errorData = await paystackRes.json();
      console.error("Paystack verification failed:", errorData);
      return NextResponse.json(
        { error: "Failed to verify payment with Paystack" },
        { status: 502 }
      );
    }

    const paystackData = await paystackRes.json();
    if (!paystackData.status || paystackData.data.status !== "success") {
      // Payment not successful
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    // Payment is successful, update the quote request
    const db = getGalanaAdminDb();
    const quoteRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(quoteId);
    const quoteSnap = await quoteRef.get();
    if (!quoteSnap.exists) {
      return NextResponse.json(
        { error: "Quote request not found" },
        { status: 404 }
      );
    }

    await quoteRef.update({
      paymentStatus: "paid",
      paymentReference: reference,
      updatedAt: FieldValue.serverTimestamp(),
      lastUpdatedBy: "paystack_system", // or we could leave it null
    });

    // Optionally, we could also set a flag that payment is complete and maybe send an email, etc.

    return NextResponse.json({ ok: true, message: "Payment verified and quote updated" });
  } catch (error) {
    console.error("[api/paystack/verify]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}