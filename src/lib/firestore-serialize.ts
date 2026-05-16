import type { Timestamp } from "firebase-admin/firestore";

export function timestampToIso(v: unknown): string {
  if (
    v &&
    typeof v === "object" &&
    "toDate" in v &&
    typeof (v as Timestamp).toDate === "function"
  ) {
    return (v as Timestamp).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return "";
}
