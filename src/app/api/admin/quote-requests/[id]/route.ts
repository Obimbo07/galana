import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { AdminApiError, requireAdminStaff } from "@/lib/admin-api-auth";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { quoteRequestFromDoc } from "@/lib/quote-request-document";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";

const STATUSES: Set<string> = new Set([
  "processing",
  "quoted",
  "confirmed",
  "declined",
  "archived",
]);

const PAYMENT_STATUSES = new Set(["pending", "paid", "failed"]);

export const toQuote = quoteRequestFromDoc;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminStaff(req);
    const { id } = await params;
    const db = getGalanaAdminDb();
    const snap = await db.collection(QUOTE_REQUESTS_COLLECTION).doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, message: "Not found" }, {
        status: 404,
      });
    }
    return NextResponse.json({
      ok: true,
      item: quoteRequestFromDoc(snap.id, snap.data()!),
    });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return NextResponse.json({ ok: false, message: e.message }, {
        status: e.status,
      });
    }
    throw e;
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminStaff(req);
    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, message: "Invalid JSON" }, {
        status: 400,
      });
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ ok: false, message: "Invalid body" }, {
        status: 400,
      });
    }
    const b = body as Record<string, unknown>;
    const hasStatus = typeof b.status === "string";
    const hasNote = typeof b.internalNote === "string";
    const hasTotal = "totalPrice" in b;
    const hasPayment = "paymentStatus" in b;

    if (!hasStatus && !hasNote && !hasTotal && !hasPayment) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Send at least one field: status, internalNote, totalPrice, paymentStatus.",
        },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      lastUpdatedBy: user.uid,
    };

    if (hasStatus) {
      const statusVal = String(b.status);
      if (!STATUSES.has(statusVal)) {
        return NextResponse.json(
          { ok: false, message: "Invalid status value." },
          { status: 400 }
        );
      }
      patch.status = statusVal;
    }
    if (hasNote) {
      patch.internalNote = b.internalNote;
    }

    if (hasTotal) {
      const tp = b.totalPrice;
      if (tp === null || tp === "") {
        patch.totalPrice = FieldValue.delete();
      } else if (
        typeof tp === "number" &&
        Number.isFinite(tp) &&
        tp >= 0
      ) {
        patch.totalPrice = tp;
      } else {
        return NextResponse.json(
          { ok: false, message: "totalPrice must be a non‑negative number or null." },
          { status: 400 }
        );
      }
    }

    if (hasPayment) {
      const ps = b.paymentStatus;
      if (ps === null || ps === "") {
        patch.paymentStatus = FieldValue.delete();
      } else if (typeof ps === "string" && PAYMENT_STATUSES.has(ps)) {
        patch.paymentStatus = ps;
      } else {
        return NextResponse.json(
          {
            ok: false,
            message: "paymentStatus must be pending, paid, failed, or null.",
          },
          { status: 400 }
        );
      }
    }

    const db = getGalanaAdminDb();
    const ref = db.collection(QUOTE_REQUESTS_COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, message: "Not found" }, {
        status: 404,
      });
    }
    await ref.set(patch, { merge: true });
    const next = await ref.get();
    return NextResponse.json({
      ok: true,
      item: quoteRequestFromDoc(next.id, next.data()!),
    });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return NextResponse.json({ ok: false, message: e.message }, {
        status: e.status,
      });
    }
    throw e;
  }
}
