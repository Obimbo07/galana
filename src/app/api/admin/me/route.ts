import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { AdminApiError, requireAdminStaff } from "@/lib/admin-api-auth";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { timestampToIso } from "@/lib/firestore-serialize";

export async function GET(req: Request) {
  try {
    const user = await requireAdminStaff(req);
    const db = getGalanaAdminDb();
    const snap = await db.collection("admin_profiles").doc(user.uid).get();
    const d = snap.data()!;
    return NextResponse.json({
      ok: true,
      profile: {
        uid: user.uid,
        email: user.email,
        displayName: (d.displayName as string) || user.displayName,
        role: user.role,
        phone: (d.phone as string) || "",
        jobTitle: (d.jobTitle as string) || "",
        department: (d.department as string) || "",
        photoUrl: (d.photoUrl as string) || "",
        createdAt: timestampToIso(d.createdAt),
        updatedAt: timestampToIso(d.updatedAt),
      },
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

export async function PATCH(req: Request) {
  try {
    const user = await requireAdminStaff(req);
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
    };
    for (const key of [
      "displayName",
      "phone",
      "jobTitle",
      "department",
      "photoUrl",
    ] as const) {
      if (typeof b[key] === "string") patch[key] = b[key];
    }
    const db = getGalanaAdminDb();
    await db.collection("admin_profiles").doc(user.uid).set(patch, {
      merge: true,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return NextResponse.json({ ok: false, message: e.message }, {
        status: e.status,
      });
    }
    throw e;
  }
}
