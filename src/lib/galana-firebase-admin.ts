import {
  cert,
  getApp,
  getApps,
  initializeApp,
  applicationDefault,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export type ServiceAccountEnvParse =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; reason: "missing" | "invalid_json" | "not_object" };

/** Parse FIREBASE_SERVICE_ACCOUNT_JSON; distinguishes missing vs invalid JSON. */
export function parseServiceAccountJsonFromEnv(): ServiceAccountEnvParse {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return { ok: false, reason: "missing" };
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, reason: "not_object" };
    }
    return { ok: true, data: data as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}

export function isGalanaFirebaseAdminConfigured(): boolean {
  const parsed = parseServiceAccountJsonFromEnv();
  if (parsed.ok) return true;
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
}

/**
 * Returns the default Firebase Admin app, initializing once per process.
 * Reuses `getApp()` when the default app already exists (Next dev HMR, repeated imports).
 */
export function getGalanaFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const parsed = parseServiceAccountJsonFromEnv();

  if (parsed.ok) {
    try {
      return initializeApp({
        credential: cert(parsed.data as ServiceAccount),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Invalid service account for Firebase Admin: ${msg}. Check project_id, client_email, and private_key in FIREBASE_SERVICE_ACCOUNT_JSON.`
      );
    }
  }

  const adc = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (adc) {
    try {
      return initializeApp({ credential: applicationDefault() });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Could not load credentials from GOOGLE_APPLICATION_CREDENTIALS (${adc}): ${msg}`
      );
    }
  }

  if (!parsed.ok && parsed.reason !== "missing") {
    throw new Error(
      parsed.reason === "invalid_json"
        ? "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Paste the full service account JSON as one line, or set GOOGLE_APPLICATION_CREDENTIALS to a key file path."
        : "FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object (service account key)."
    );
  }

  throw new Error(
    "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (service account JSON, one line) or GOOGLE_APPLICATION_CREDENTIALS (path to the key file)."
  );
}

export function tryGetGalanaFirebaseAdminApp(): App | null {
  if (!isGalanaFirebaseAdminConfigured()) return null;
  try {
    return getGalanaFirebaseAdminApp();
  } catch {
    return null;
  }
}

export function getGalanaAdminDb(): Firestore {
  return getFirestore(getGalanaFirebaseAdminApp());
}

export function getGalanaAdminAuth(): Auth {
  return getAuth(getGalanaFirebaseAdminApp());
}
