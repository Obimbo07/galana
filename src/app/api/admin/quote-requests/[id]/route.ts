import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { AdminApiError, requireAdminStaff } from "@/lib/admin-api-auth";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { timestampToIso } from "@/lib/firestore-serialize";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import type { QuoteRequest, QuoteRequestStatus } from "@/types/galana-firestore";

const STATUSES: Set<string> = new Set([
  "processing",
  "quoted",
  "confirmed",
  "declined",
  "archived",
]);

function toQuote(id: string, d: DocumentData): QuoteRequest {
  const statusRaw = d.status;
  const status: QuoteRequestStatus = STATUSES.has(statusRaw)
    ? (statusRaw as QuoteRequestStatus)
    : "processing";
  const payload = (d.payload ?? {}) as QuoteRequest["payload"];
  const fromPhoneRaw = d.fromPhone ?? payload.fromPhone;
  const locRaw = d.customerLocation ?? payload.location;
  return {
    id,
    kind: d.kind === "order" ? "order" : "quote",
    status,
    fromEmail: String(d.fromEmail ?? ""),
    fromPhone:
      typeof fromPhoneRaw === "string" && fromPhoneRaw.trim()
        ? fromPhoneRaw.trim()
        : undefined,
    customerLocation:
      typeof locRaw === "string" && locRaw.trim() ? locRaw.trim() : undefined,
    pageUrl: String(d.pageUrl ?? ""),
    payload,
    internalNote:
      typeof d.internalNote === "string" ? d.internalNote : undefined,
    lastUpdatedBy:
      typeof d.lastUpdatedBy === "string" ? d.lastUpdatedBy : undefined,
    createdAt: timestampToIso(d.createdAt),
    updatedAt: timestampToIso(d.updatedAt),
  };
}

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
      item: toQuote(snap.id, snap.data()!),
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
    const patch: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      lastUpdatedBy: user.uid,
    };
    const hasStatus = typeof b.status === "string";
    const hasNote = typeof b.internalNote === "string";
    if (!hasStatus && !hasNote) {
      return NextResponse.json(
        {
          ok: false,
          message: "Send status and/or internalNote to update.",
        },
        { status: 400 }
      );
    }
    const statusVal = hasStatus ? String(b.status) : "";
    if (hasStatus && !STATUSES.has(statusVal)) {
      return NextResponse.json(
        { ok: false, message: "Invalid status value." },
        { status: 400 }
      );
    }
    if (hasStatus) {
      patch.status = statusVal;
    }
    if (hasNote) {
      patch.internalNote = b.internalNote;
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
      item: toQuote(next.id, next.data()!),
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
