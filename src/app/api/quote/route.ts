import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const forwardUrl =
    process.env.QUOTE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_QUOTE_API_URL?.trim();

  if (!forwardUrl) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "QUOTE_API_URL is not set. Add it to .env to forward quote payloads to your backend.",
      },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  try {
    const r = await fetch(forwardUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, message: `Upstream HTTP ${r.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to reach QUOTE_API_URL" },
      { status: 502 }
    );
  }
}
