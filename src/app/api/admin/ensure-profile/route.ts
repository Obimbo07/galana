import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { roleForEmail } from "@/lib/admin-email-allowlist";
import { getGalanaAdminAuth, getGalanaAdminDb } from "@/lib/galana-firebase-admin";

export async function POST(req: Request) {
  try {
    const auth = getGalanaAdminAuth();
    const db = getGalanaAdminDb();
    const hdr = req.headers.get("authorization");
    if (!hdr?.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, {
        status: 401,
      });
    }
    const idToken = hdr.slice(7);
    let decoded: { uid: string; email?: string; name?: string };
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ ok: false, message: "Invalid token" }, {
        status: 401,
      });
    }
    const email = decoded.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Your sign-in must include an email address." },
        { status: 400 }
      );
    }
    const role = roleForEmail(email);
    if (!role) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "This email is not authorised for the Galana admin console. Ask an owner to add it to GALANA_ADMIN_EMAILS or GALANA_STAFF_EMAILS.",
        },
        { status: 403 }
      );
    }

    const ref = db.collection("admin_profiles").doc(decoded.uid);
    const existing = await ref.get();
    const displayName =
      (existing.get("displayName") as string | undefined)?.trim() ||
      decoded.name?.trim() ||
      email.split("@")[0] ||
      "Team member";

    await ref.set(
      {
        email,
        displayName,
        role,
        updatedAt: FieldValue.serverTimestamp(),
        ...(existing.exists
          ? {}
          : {
              createdAt: FieldValue.serverTimestamp(),
              phone: "",
              jobTitle: "",
              department: "",
            }),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, role, email, displayName });
  } catch (e) {
    console.error("[api/admin/ensure-profile]", e);
    const message =
      e instanceof Error
        ? e.message
        : "Unexpected error while using Firebase Admin.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
