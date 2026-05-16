import type { DocumentData } from "firebase-admin/firestore";
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
      toQuote(doc.id, doc.data())
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
