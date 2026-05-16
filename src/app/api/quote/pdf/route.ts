import { NextResponse } from "next/server";
import { getGalanaAdminDb } from "@/lib/galana-firebase-admin";
import { loadSiteData } from "@/lib/load-site-data";
import { loadGalanaLogoDataUri } from "@/lib/quote-logo";
import { buildLetterheadFromSiteData } from "@/lib/quote-pdf-letterhead";
import { renderQuotePdfBuffer } from "@/lib/quote-pdf";
import { QUOTE_REQUESTS_COLLECTION } from "@/lib/quote-request-firestore";
import { timestampToIso } from "@/lib/firestore-serialize";
import type {
  QuoteRequestStatus,
  SiteQuotePayload,
} from "@/types/galana-firestore";

const STATUSES = new Set<string>([
  "processing",
  "quoted",
  "confirmed",
  "declined",
  "archived",
]);

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing quote id." }, {
      status: 400,
    });
  }

  try {
    const db = getGalanaAdminDb();
    const snap = await db.collection(QUOTE_REQUESTS_COLLECTION).doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, message: "Quote not found." }, {
        status: 404,
      });
    }
    const d = snap.data()!;
    const statusRaw = d.status;
    const status: QuoteRequestStatus = STATUSES.has(statusRaw)
      ? (statusRaw as QuoteRequestStatus)
      : "processing";
    const created = timestampToIso(d.createdAt);
    const createdAtLabel =
      created ||
      new Date().toLocaleString("en-KE", {
        dateStyle: "medium",
        timeStyle: "short",
      });

    const site = loadSiteData();
    const letterhead = buildLetterheadFromSiteData(
      site,
      loadGalanaLogoDataUri()
    );

    const buf = await renderQuotePdfBuffer({
      id: snap.id,
      status,
      kind: d.kind === "order" ? "order" : "quote",
      fromEmail: String(d.fromEmail ?? ""),
      pageUrl: String(d.pageUrl ?? ""),
      payload: (d.payload ?? {}) as SiteQuotePayload,
      createdAtLabel,
      letterhead,
    });

    const safeName = `galana-quote-${snap.id.slice(0, 12)}.pdf`;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[api/quote/pdf]", e);
    return NextResponse.json(
      {
        ok: false,
        message:
          e instanceof Error
            ? e.message
            : "Could not generate PDF. Check Firebase Admin configuration.",
      },
      { status: 500 }
    );
  }
}
