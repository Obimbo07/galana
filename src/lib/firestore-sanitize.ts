/**
 * Firestore does not allow `undefined` as a field value. Strip keys with
 * undefined recursively so quote payloads from the API route always write.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) {
      continue;
    }
    out[k] = stripUndefinedDeep(v);
  }
  return out as T;
}
