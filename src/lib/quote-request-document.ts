import type { DocumentData } from "firebase-admin/firestore";
import { timestampToIso } from "@/lib/firestore-serialize";
import type { QuoteRequest, QuoteRequestStatus } from "@/types/galana-firestore";

const REQUEST_STATUSES: Set<string> = new Set([
  "processing",
  "quoted",
  "confirmed",
  "declined",
  "archived",
]);

/** Map Firestore `quote_requests` document → QuoteRequest (admin APIs + shared reads). */
export function quoteRequestFromDoc(id: string, d: DocumentData): QuoteRequest {
  const statusRaw = d.status;
  const status: QuoteRequestStatus = REQUEST_STATUSES.has(statusRaw)
    ? (statusRaw as QuoteRequestStatus)
    : "processing";
  const payload = (d.payload ?? {}) as QuoteRequest["payload"];
  const topEmail =
    typeof d.fromEmail === "string" ? d.fromEmail.trim() : "";
  const payloadEmail =
    typeof payload.fromEmail === "string" ? payload.fromEmail.trim() : "";
  const fromPhoneRaw = d.fromPhone ?? payload.fromPhone;
  const locRaw = d.customerLocation ?? payload.location;
  return {
    id,
    kind: d.kind === "order" ? "order" : "quote",
    status,
    fromEmail: topEmail || payloadEmail || "",
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
    totalPrice: d.totalPrice ?? undefined,
    paymentStatus: d.paymentStatus ?? undefined,
    paymentReference:
      typeof d.paymentReference === "string" && d.paymentReference.trim()
        ? d.paymentReference.trim()
        : undefined,
    createdAt: timestampToIso(d.createdAt),
    updatedAt: timestampToIso(d.updatedAt),
  };
}
