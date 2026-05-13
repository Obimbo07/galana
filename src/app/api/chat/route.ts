import {
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIError,
  GoogleGenerativeAIResponseError,
} from "@google/generative-ai";
import { NextResponse } from "next/server";
import { loadSiteData } from "@/lib/load-site-data";
import {
  buildFullSystemInstruction,
  buildSelectionSummary,
  createGeminiModel,
  normalizeGeminiHistory,
} from "@/lib/gemini-chat";
import type {
  ChatApiMessage,
  ChatErrorBody,
  ChatRequestBody,
} from "@/types/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function isChatRole(
  x: unknown
): x is "user" | "assistant" | "system" {
  return x === "user" || x === "assistant" || x === "system";
}

function parseMessages(raw: unknown): ChatApiMessage[] {
  if (!Array.isArray(raw)) throw new Error("messages must be an array.");
  if (raw.length > 48) throw new Error("Too many messages in one request.");
  const out: ChatApiMessage[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid message.");
    }
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (!isChatRole(role) || typeof content !== "string") {
      throw new Error("Each message needs role user|assistant|system and content string.");
    }
    if (content.length > 16000) {
      throw new Error("Message exceeds length limit.");
    }
    out.push({ role, content });
  }
  return out;
}

function parseBody(body: unknown): ChatRequestBody {
  if (!body || typeof body !== "object") {
    throw new Error("Body must be a JSON object.");
  }
  const b = body as Record<string, unknown>;
  const messages = parseMessages(b.messages);
  if (!messages.some((m) => m.role === "user")) {
    throw new Error("Provide at least one user message.");
  }

  let selectedProductIds: string[] | undefined;
  const sel = b.selectedProductIds;
  if (sel !== undefined) {
    if (!Array.isArray(sel)) throw new Error("selectedProductIds must be an array.");
    selectedProductIds = [...new Set(sel.map(String))].slice(0, 32);
  }

  let sessionId: string | undefined;
  if (b.sessionId !== undefined) {
    if (typeof b.sessionId !== "string") throw new Error("sessionId must be a string.");
    sessionId = b.sessionId.trim().slice(0, 80) || undefined;
  }

  const stream =
    b.stream === true ||
    String(b.mode ?? "").toLowerCase() === "stream";

  return {
    messages,
    sessionId,
    selectedProductIds,
    stream,
  };
}

function summarizeGeminiFailure(err: unknown): string {
  if (err instanceof GoogleGenerativeAIResponseError)
    return "The assistant could not complete that reply. Try shorter questions or WhatsApp.";
  if (err instanceof GoogleGenerativeAIAbortError)
    return "Assistant request cancelled.";
  if (err instanceof GoogleGenerativeAIError)
    return "Assistant service temporarily unavailable.";
  return "Assistant encountered an unexpected error.";
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const payload: ChatErrorBody = {
      ok: false,
      message:
        "GEMINI_API_KEY is not configured. AI assistant is unavailable; use WhatsApp or email for quotes.",
    };
    return NextResponse.json(payload, { status: 503 });
  }

  let parsed: ChatRequestBody;
  try {
    parsed = parseBody(await req.json());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON body.";
    const payload: ChatErrorBody = { ok: false, message: msg };
    return NextResponse.json(payload, { status: 400 });
  }

  const data = loadSiteData();
  const selectionBlock = buildSelectionSummary(
    data,
    parsed.selectedProductIds ?? []
  );
  const instruction = buildFullSystemInstruction(data, selectionBlock);

  let history;
  let lastUserText;
  try {
    ({ history, lastUserText } = normalizeGeminiHistory(parsed.messages));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad message history.";
    const payload: ChatErrorBody = { ok: false, message: msg };
    return NextResponse.json(payload, { status: 400 });
  }

  const model = createGeminiModel(apiKey, instruction);
  const signal = req.signal;

  try {
    if (parsed.stream) {
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let chat;
          try {
            chat = model.startChat({
              history: history.slice(),
            });
            const geminiRes = await chat.sendMessageStream(lastUserText, {
              signal,
            });
            let streamedFull = "";
            try {
              for await (const chunk of geminiRes.stream) {
                let full = "";
                try {
                  full = chunk.text();
                } catch {
                  full = "";
                }
                if (!full || full === streamedFull) continue;
                if (full.startsWith(streamedFull)) {
                  const delta = full.slice(streamedFull.length);
                  streamedFull = full;
                  if (delta) {
                    controller.enqueue(
                      encoder.encode(
                        `${JSON.stringify({ delta })}\n`
                      )
                    );
                  }
                  continue;
                }
                streamedFull = full;
                controller.enqueue(
                  encoder.encode(`${JSON.stringify({ delta: full })}\n`)
                );
              }
            } catch (loopErr: unknown) {
              const fallback = summarizeGeminiFailure(loopErr);
              controller.enqueue(
                encoder.encode(
                  `${JSON.stringify({ error: fallback })}\n`
                )
              );
              controller.close();
              return;
            }

            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  done: true,
                  sessionId: parsed.sessionId,
                })}\n`
              )
            );
            controller.close();
          } catch (outerErr: unknown) {
            const fallback =
              summarizeGeminiFailure(outerErr);
            controller.enqueue(
              encoder.encode(`${JSON.stringify({ error: fallback })}\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const chat = model.startChat({ history });
    const res = await chat.sendMessage(lastUserText, { signal });
    let full = "";
    try {
      full = res.response.text();
    } catch (extractErr: unknown) {
      const payload: ChatErrorBody = {
        ok: false,
        message: summarizeGeminiFailure(extractErr),
      };
      return NextResponse.json(payload, { status: 422 });
    }
    return NextResponse.json({
      message: full.trim(),
      sessionId: parsed.sessionId,
    });
  } catch (err: unknown) {
    const payload: ChatErrorBody = {
      ok: false,
      message: summarizeGeminiFailure(err),
    };
    return NextResponse.json(payload, { status: 503 });
  }
}
