"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  extractSuggestedCalculator,
  findMentionedProductIds,
} from "@/lib/chat-parse";
import { useGalana } from "@/providers/galana-provider";
import type { ChatApiMessage, SuggestedCalculatorPayload } from "@/types/chat";
import type { SiteData } from "@/types/site-data";

type CatalogProduct = {
  id: string;
  name: string;
  cat: string;
  catLabel: string;
  use: string;
  image: string;
};

function newSessionId(): string {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  if (c?.getRandomValues) {
    const u = new Uint8Array(8);
    c.getRandomValues(u);
    const hex = [...u].map((x) => x.toString(16).padStart(2, "0")).join("");
    return `sess-${hex}`;
  }
  return "sess-client";
}

function inlineBold(text: string) {
  const nodes: React.ReactNode[] = [];
  const re = /\*\*((?:[^*]|\*(?!\*))+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    nodes.push(
      <strong key={`${m.index}b`}>{m[1].replace(/\n/g, " ")}</strong>
    );
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : text;
}

function MessagePara({ body }: { body: string }) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  return (
    <>
      {lines.map((ln, idx) => (
        <span key={`${idx}:${ln.slice(0, 32)}:${ln.length}`}>
          {idx > 0 ? <br /> : null}
          {inlineBold(ln)}
        </span>
      ))}
    </>
  );
}

function liteMarkdownChunks(src: string) {
  return src
    .trim()
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter(Boolean);
}

async function consumeNdjsonChat(
  res: Response,
  onDelta: (t: string) => void
): Promise<{ error?: string }> {
  const reader = res.body?.getReader();
  if (!reader) return { error: "No response body." };

  const dec = new TextDecoder();
  let carry = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      carry += dec.decode(value, { stream: true });
      let ix: number;

      while ((ix = carry.indexOf("\n")) >= 0) {
        const line = carry.slice(0, ix).trim();
        carry = carry.slice(ix + 1);
        if (!line) continue;

        try {
          const parsed = JSON.parse(line) as Record<string, unknown>;
          if (typeof parsed.delta === "string" && parsed.delta.length) {
            onDelta(parsed.delta);
          }
          if (parsed.error && typeof parsed.error === "string") {
            return { error: parsed.error };
          }
        } catch {
          /* incomplete or junk line */
        }
      }
    }

    const tail = carry.trim();
    if (tail.length) {
      try {
        const parsed = JSON.parse(tail) as Record<string, unknown>;
        if (typeof parsed.delta === "string" && parsed.delta.length) {
          onDelta(parsed.delta);
        }
        if (parsed.error && typeof parsed.error === "string") {
          return { error: parsed.error };
        }
      } catch {
        /* ignore trailing partial */
      }
    }
    return {};
  } finally {
    reader.releaseLock();
  }
}

function applySuggestedToCalc(
  s: SuggestedCalculatorPayload,
  setCalc: ReturnType<typeof useGalana>["setCalc"],
  setMainTab: ReturnType<typeof useGalana>["setMainTab"]
) {
  switch (s.type) {
    case "paving":
      setMainTab("paving");
      setCalc({
        ...(s.pavingLength !== undefined ? { pavingLength: String(s.pavingLength) } : {}),
        ...(s.pavingWidth !== undefined ? { pavingWidth: String(s.pavingWidth) } : {}),
        ...(s.pavingBlocksPerM2 !== undefined
          ? { pavingBlocksPerM2: s.pavingBlocksPerM2 }
          : {}),
        ...(s.pavingWastagePercent !== undefined
          ? { pavingWaste: String(s.pavingWastagePercent) }
          : {}),
      });
      break;
    case "pipes":
      setMainTab("pipes");
      setCalc({
        ...(s.pipeLength !== undefined ? { pipeLength: String(s.pipeLength) } : {}),
        ...(s.pipeSectionM !== undefined ? { pipeSectionM: s.pipeSectionM } : {}),
        ...(s.pipeExtraPercent !== undefined
          ? { pipeExtra: String(s.pipeExtraPercent) }
          : {}),
      });
      break;
    case "roofing":
      setMainTab("roofing");
      setCalc({
        ...(s.roofArea !== undefined ? { roofArea: String(s.roofArea) } : {}),
        ...(s.roofTilesPerM2 !== undefined
          ? { roofTilesPerM2: s.roofTilesPerM2 }
          : {}),
        ...(s.roofWastagePercent !== undefined
          ? { roofWaste: String(s.roofWastagePercent) }
          : {}),
      });
      break;
    default:
      break;
  }
  document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
}

export function AssistantChat({
  data,
  soundsEnabled,
  onSoundsEnabledChange,
}: {
  data: SiteData;
  soundsEnabled: boolean;
  onSoundsEnabledChange: (enabled: boolean) => void;
}) {
  const { addToCart, setCalc, setMainTab } = useGalana();
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [messages, setMessages] = useState<ChatApiMessage[]>([
    {
      role: "assistant",
      content:
        "I'm Galana's assistant. Ask about concrete pipes, paving, roofing, precast, delivery, or estimates. I only know products from our current catalogue — for firm pricing, use **Request quote** or WhatsApp.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamVisible, setStreamVisible] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [productFilter, setProductFilter] = useState("");
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [lastSuggestion, setLastSuggestion] =
    useState<SuggestedCalculatorPayload | null>(null);
  const [sessionId] = useState(() => newSessionId());
  const logRef = useRef<HTMLDivElement | null>(null);

  const productIndex = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => r.json())
      .then((j: { products?: CatalogProduct[] }) => {
        if (cancelled) return;
        if (Array.isArray(j.products)) setCatalog(j.products);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [messages, streamVisible, busy]);

  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    const list = catalog.length ? catalog : data.products;
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.catLabel.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [catalog, data.products, productFilter]);

  const toggleProduct = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const send = useCallback(async () => {
    const t = input.trim();
    if (!t || busy) return;
    const userMsg: ChatApiMessage = { role: "user", content: t };
    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput("");
    setBusy(true);
    setStreamVisible("");

    const payload = {
      messages: nextThread,
      sessionId,
      selectedProductIds: [...selectedIds],
      stream: true,
    };

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { message?: string };
        const err =
          typeof j.message === "string"
            ? j.message
            : `Assistant unavailable (HTTP ${r.status}).`;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: err },
        ]);
        setLastSuggestion(null);
        return;
      }

      let assistantText = "";

      const ct = r.headers.get("content-type") ?? "";
      if (ct.includes("application/x-ndjson")) {
        const { error } = await consumeNdjsonChat(r, (d) => {
          assistantText += d;
          setStreamVisible((prev) => prev + d);
        });
        if (error && !assistantText.trim()) {
          setMessages((prev) => [...prev, { role: "assistant", content: error }]);
          setLastSuggestion(null);
          return;
        }
        if (error && assistantText.trim()) {
          assistantText += `\n\n_${error}_`;
        }
      } else {
        const j = (await r.json()) as { message?: string };
        assistantText =
          typeof j.message === "string" ? j.message : "Empty reply.";
        setStreamVisible(assistantText);
      }

      const finalAssistant = assistantText.trim() || "…";

      const mentioned = findMentionedProductIds(finalAssistant, data.products);
      setHighlightIds((prev) => [...new Set([...prev, ...mentioned])]);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: finalAssistant },
      ]);
      setStreamVisible("");
      setLastSuggestion(extractSuggestedCalculator(finalAssistant));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Could not reach the assistant. Check your connection, or tap WhatsApp for help.",
        },
      ]);
      setLastSuggestion(null);
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    data.products,
    input,
    messages,
    selectedIds,
    sessionId,
  ]);

  const addSelectionToCart = useCallback(() => {
    for (const id of selectedIds) {
      const p = productIndex.get(id);
      if (p) addToCart(p);
    }
  }, [addToCart, productIndex, selectedIds]);

  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);

  return (
    <div className="assistant-pane">
      <div className="assistant-pane-toolbar">
        <button
          type="button"
          className={`assistant-sound-toggle${soundsEnabled ? " on" : ""}`}
          aria-pressed={soundsEnabled}
          aria-label={
            soundsEnabled
              ? "Assistant sounds on. Click to mute."
              : "Assistant sounds off. Click to enable the open-panel chime."
          }
          onClick={() => onSoundsEnabledChange(!soundsEnabled)}
        >
          {soundsEnabled ? "Sound on" : "Sounds off"}
        </button>
      </div>
      <div className="help-chat-log assistant-log" ref={logRef}>
        <div className="assistant-greeting">
          <p className="assistant-greeting-title">What are you building today?</p>
          <p className="assistant-greeting-hint">
            Ask about Galana products, quantities, or a quote — or pick items below to
            include in your next message.
          </p>
        </div>
        {messages.map((m, i) => (
          <div
            key={`msg-${m.role}-${i}-${m.content.length}-${m.content.slice(0, 16)}`}
            className={`help-msg ${m.role === "user" ? "user" : "bot assistant-md"}${
              i === 0 && m.role === "assistant" ? " assistant-msg-intro" : ""
            }`}
          >
            {liteMarkdownChunks(m.content).map((para, pi) => (
              <div className="assistant-md-p" key={`para-${para.length}-${para.slice(0, 36)}-${pi}`}>
                <MessagePara body={para} />
              </div>
            ))}
          </div>
        ))}

        {streamVisible ? (
          <div className="help-msg bot assistant-md">
            {liteMarkdownChunks(streamVisible).map((para, pi) => (
              <div className="assistant-md-p" key={`stream-${para.length}-${para.slice(0, 36)}-${pi}`}>
                <MessagePara body={para} />
              </div>
            ))}
            <span className="assistant-caret" aria-hidden />
          </div>
        ) : null}

        {busy && !streamVisible ? (
          <div className="help-msg bot assistant-typing" aria-live="polite">
            <span className="assistant-dot" />
            <span className="assistant-dot" />
            <span className="assistant-dot" />
          </div>
        ) : null}
      </div>

      {lastSuggestion ? (
        <div className="assistant-suggest-bar">
          <button
            type="button"
            className="assistant-suggest-btn"
            onClick={() => applySuggestedToCalc(lastSuggestion, setCalc, setMainTab)}
          >
            Apply estimate to calculator
          </button>
        </div>
      ) : null}

      <div className="assistant-product-panel">
        <div className="assistant-product-head">
          <span>Products</span>
          <input
            type="search"
            className="assistant-product-search"
            placeholder="Filter…"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            aria-label="Filter products"
          />
        </div>
        <div className="assistant-chip-row">
          {filteredProducts.slice(0, 80).map((p) => {
            const on = selectedIds.has(p.id);
            const hi = highlightSet.has(p.id);
            return (
              <button
                type="button"
                key={p.id}
                className={`assistant-chip${on ? " on" : ""}${hi ? " hi" : ""}`}
                onClick={() => toggleProduct(p.id)}
                title={p.use}
              >
                {p.name}
              </button>
            );
          })}
        </div>
        <div className="assistant-actions">
          <button
            type="button"
            className="assistant-cart-btn"
            disabled={!selectedIds.size || busy}
            onClick={addSelectionToCart}
          >
            Add selection to basket
          </button>
          {selectedIds.size ? (
            <span className="assistant-sel-hint">
              {selectedIds.size} selected — sent with your next message
            </span>
          ) : null}
        </div>
      </div>

      <div className="help-chat-input-row assistant-input-row">
        <input
          type="text"
          placeholder="Message Galana…"
          autoComplete="off"
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) void send();
          }}
        />
        <button type="button" onClick={() => void send()} disabled={busy}>
          Send
        </button>
      </div>
    </div>
  );
}