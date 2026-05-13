import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Content } from "@google/generative-ai";
import {
  buildAssistantContextBlock,
  GALANA_ASSISTANT_BASE_PROMPT,
} from "@/lib/chat-context";
import type { ChatApiMessage } from "@/types/chat";
import type { SiteData } from "@/types/site-data";

export function resolveGeminiModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}

export function buildFullSystemInstruction(
  data: SiteData,
  selectedProductLines: string
): string {
  const sel =
    selectedProductLines.trim().length > 0
      ? `\n\n=== USER HAS SELECTED PRODUCTS ===\n${selectedProductLines}\nReference these IDs when advising basket additions or quotations.\n`
      : "";

  return [
    GALANA_ASSISTANT_BASE_PROMPT,
    "\n\n=== LIVE SITE CONTEXT (this request) ===\n",
    buildAssistantContextBlock(data),
    sel,
  ].join("");
}

function formatSelectedProducts(
  data: SiteData,
  ids: string[] | undefined
): string {
  if (!ids?.length) return "";
  const map = new Map(data.products.map((p) => [p.id, p]));
  return ids
    .map((id) => {
      const p = map.get(id);
      return p
        ? `- ${p.id} — ${p.name} (${p.catLabel})`
        : `- ${id} (not found in catalogue snapshot)`;
    })
    .join("\n");
}

function mergeAdjacentSameRole(history: Content[]): Content[] {
  const out: Content[] = [];
  for (const c of history) {
    const text = String(c.parts?.[0]?.text ?? "").trim();
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === c.role) {
      const prevText = String(last.parts?.[0]?.text ?? "");
      last.parts = [{ text: `${prevText}\n\n${text}` }];
      continue;
    }
    out.push({ role: c.role, parts: [{ text }] });
  }
  return out;
}

/** Prepare Gemini chat history + final user prompt. Drops leading orphan assistant turns. */
export function normalizeGeminiHistory(messages: ChatApiMessage[]): {
  history: Content[];
  lastUserText: string;
} {
  const systemHints = messages
    .filter((m) => m.role === "system")
    .map((m) => String(m.content ?? "").trim())
    .filter(Boolean)
    .join("\n\n");

  const conv = messages.filter((m) => m.role !== "system");
  if (!conv.length) {
    throw new Error("messages must include at least one user turn.");
  }

  const last = conv[conv.length - 1];
  if (last.role !== "user") {
    throw new Error("Latest message must be from the user.");
  }

  const lastUserBare = String(last.content ?? "").trim();
  if (!lastUserBare) {
    throw new Error("User message is empty.");
  }

  const lastUserText = systemHints
    ? `Notes from visitor session:\n${systemHints}\n\n---\n\n${lastUserBare}`
    : lastUserBare;

  const raw: Content[] = [];
  for (const m of conv.slice(0, -1)) {
    const text = String(m.content ?? "").trim();
    if (!text) continue;

    if (m.role === "user") {
      raw.push({ role: "user", parts: [{ text }] });
    } else if (m.role === "assistant") {
      raw.push({ role: "model", parts: [{ text }] });
    }
  }

  let history = mergeAdjacentSameRole(raw);
  while (history.length && history[0].role !== "user") {
    history = history.slice(1);
  }

  const clipped: Content[] = [];
  let expectUser = true;
  for (const c of history) {
    const isUser = c.role === "user";
    if (isUser !== expectUser) continue;
    clipped.push(c);
    expectUser = !expectUser;
  }

  history = clipped;

  while (history.length && history[history.length - 1]?.role === "user") {
    history = history.slice(0, -1);
  }

  return { history, lastUserText };
}

export function createGeminiModel(apiKey: string, systemInstruction: string) {
  const ai = new GoogleGenerativeAI(apiKey);
  return ai.getGenerativeModel({
    model: resolveGeminiModelName(),
    systemInstruction,
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: 2048,
    },
  });
}

export function buildSelectionSummary(
  data: SiteData,
  selectedProductIds: string[] | undefined
): string {
  return formatSelectedProducts(data, selectedProductIds);
}
