import { NextResponse } from "next/server";
import { isGalanaFirebaseAdminConfigured } from "@/lib/galana-firebase-admin";
import { createQuoteRequestDoc } from "@/lib/quote-request-firestore";
import type { QuoteRequestKind, SiteQuotePayload } from "@/types/galana-firestore";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }
  if (!isRecord(body)) {
    return NextResponse.json(
      { ok: false, message: "Expected JSON object" },
      { status: 400 }
    );
  }

  const forwardUrl =
    process.env.QUOTE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_QUOTE_API_URL?.trim();

  const firebaseConfigured = isGalanaFirebaseAdminConfigured();

  if (!firebaseConfigured && !forwardUrl) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "No quote backend configured. Set FIREBASE_SERVICE_ACCOUNT_JSON for Firestore and/or QUOTE_API_URL. See .env.example.",
      },
      { status: 501 }
    );
  }

  const calculator = isRecord(body.calculator) ? body.calculator : {};
  const lines = Array.isArray(calculator.lines)
    ? (calculator.lines as unknown[]).map(String)
    : [];
  const activeMainTab =
    typeof calculator.activeMainTab === "string"
      ? calculator.activeMainTab
      : "";
  const cart = Array.isArray(body.cart) ? body.cart : [];

  const sourceRaw = str(body.source);
  const source: SiteQuotePayload["source"] =
    sourceRaw === "contact" || sourceRaw === "cart" || sourceRaw === "calculator"
      ? sourceRaw
      : undefined;

  const payload: SiteQuotePayload = {
    fromEmail: str(body.fromEmail).trim(),
    fromPhone: str(body.fromPhone).trim() || undefined,
    location: str(body.location).trim() || undefined,
    fullName: str(body.fullName).trim() || undefined,
    company: str(body.company).trim() || undefined,
    inquiryCategory: str(body.inquiryCategory).trim() || undefined,
    inquiryMessage: str(body.inquiryMessage).trim() || undefined,
    pageUrl: str(body.pageUrl).trim(),
    calculator: { lines, activeMainTab },
    cart: cart as SiteQuotePayload["cart"],
    kind: body.kind === "order" ? "order" : undefined,
    source,
  };

  const kind: QuoteRequestKind =
    body.kind === "order" ? "order" : "quote";

  // Extract totalPrice from body, if present and is a number
  const totalPrice =
    typeof body.totalPrice === "number" && !isNaN(body.totalPrice)
      ? body.totalPrice
      : undefined;

  let firestoreId: string | null = null;
  if (firebaseConfigured) {
    try {
      firestoreId = await createQuoteRequestDoc({ payload, kind, totalPrice });
    } catch (e) {
      console.error("[api/quote] Firestore save failed:", e);
      const detail =
        e instanceof Error
          ? e.message
          : "Unknown error writing to Firestore.";
      if (!forwardUrl) {
        return NextResponse.json(
          {
            ok: false,
            message: `Could not save quote to Firestore: ${detail}`,
          },
          { status: 502 }
        );
      }
    }
  }

  if (forwardUrl) {
    try {
      const r = await fetch(forwardUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, firestoreId: firestoreId ?? undefined }),
      });
      if (!r.ok) {
        return NextResponse.json(
          {
            ok: false,
            message: `Upstream HTTP ${r.status}`,
            id: firestoreId,
          },
          { status: 502 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to reach QUOTE_API_URL",
          id: firestoreId,
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ ok: true, id: firestoreId });
}