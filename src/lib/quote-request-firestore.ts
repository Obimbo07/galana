import { FieldValue } from "firebase-admin/firestore";
import { stripUndefinedDeep } from "@/lib/firestore-sanitize";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import type {
  QuoteRequestKind,
  QuoteRequestStatus,
  SiteQuotePayload,
} from "@/types/galana-firestore";

const COLLECTION = "quote_requests";

export async function createQuoteRequestDoc(params: {
  payload: SiteQuotePayload;
  kind?: QuoteRequestKind;
}): Promise<string> {
  const db = getGalanaAdminDb();
  const kind: QuoteRequestKind = params.kind ?? "quote";
  const status: QuoteRequestStatus = "processing";
  const fromEmail =
    typeof params.payload.fromEmail === "string"
      ? params.payload.fromEmail.trim()
      : "";
  const fromPhone =
    typeof params.payload.fromPhone === "string"
      ? params.payload.fromPhone.trim()
      : "";
  const customerLocation =
    typeof params.payload.location === "string"
      ? params.payload.location.trim()
      : "";
  const pageUrl =
    typeof params.payload.pageUrl === "string"
      ? params.payload.pageUrl.trim()
      : "";

  const cleanPayload = stripUndefinedDeep(params.payload);

  const ref = await db.collection(COLLECTION).add({
    kind,
    status,
    fromEmail,
    fromPhone,
    customerLocation,
    pageUrl,
    payload: cleanPayload,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export { COLLECTION as QUOTE_REQUESTS_COLLECTION };
