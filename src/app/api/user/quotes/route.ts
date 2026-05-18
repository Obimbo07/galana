import { NextRequest, NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getGalanaAdminAuth, getGalanaAdminDb } from "@/lib/galana-firebase-admin";

function createdAtMillis(data: Record<string, unknown>): number {
  const c = data.createdAt as { toMillis?: () => number } | number | undefined;
  if (c && typeof c === "object" && typeof c.toMillis === "function") {
    return c.toMillis();
  }
  if (typeof c === "number") return c;
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getGalanaAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const userEmail = decoded.email;

    const db = getGalanaAdminDb();

    /** Match docs tied to this account (including legacy rows missing `fromEmail`). */
    const queries = [
      db.collection("quote_requests").where("userId", "==", uid).limit(50).get(),
    ];
    if (userEmail) {
      queries.push(
        db
          .collection("quote_requests")
          .where("fromEmail", "==", userEmail)
          .limit(50)
          .get()
      );
    }

    const snapshots = await Promise.all(queries);
    const byId = new Map<string, QueryDocumentSnapshot>();

    for (const snapshot of snapshots) {
      for (const doc of snapshot.docs) {
        byId.set(doc.id, doc);
      }
    }

    const quotes = [...byId.values()]
      .sort((a, b) => createdAtMillis(b.data() as Record<string, unknown>) - createdAtMillis(a.data() as Record<string, unknown>))
      .slice(0, 50)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Error fetching user quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
