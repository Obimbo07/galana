import {
  getGalanaAdminAuth,
  getGalanaAdminDb,
} from "@/lib/galana-firebase-admin";
import type { AdminRole } from "@/types/galana-firestore";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export type AdminStaffSession = {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  phone?: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
};

export async function requireAdminStaff(req: Request): Promise<AdminStaffSession> {
  const auth = getGalanaAdminAuth();
  const db = getGalanaAdminDb();
  const hdr = req.headers.get("authorization");
  if (!hdr?.startsWith("Bearer ")) {
    throw new AdminApiError("Unauthorized", 401);
  }
  const idToken = hdr.slice(7);
  let decoded: { uid: string; email?: string };
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    throw new AdminApiError("Invalid or expired token", 401);
  }
  const snap = await db.collection("admin_profiles").doc(decoded.uid).get();
  if (!snap.exists) {
    throw new AdminApiError("No admin profile for this account", 403);
  }
  const role = snap.get("role") as AdminRole | undefined;
  if (role !== "admin" && role !== "staff") {
    throw new AdminApiError("Forbidden", 403);
  }
  const data = snap.data()!;
  return {
    uid: decoded.uid,
    email: (data.email as string) || decoded.email || "",
    displayName: (data.displayName as string) || "",
    role,
    phone: data.phone as string | undefined,
    jobTitle: data.jobTitle as string | undefined,
    department: data.department as string | undefined,
    photoUrl: data.photoUrl as string | undefined,
  };
}
