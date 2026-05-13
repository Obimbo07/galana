"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractSuggestedCalculator } from "@/lib/chat-parse";
import { useGalana } from "@/providers/galana-provider";
import type { ChatApiMessage, SuggestedCalculatorPayload } from "@/types/chat";

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
  soundsEnabled,
  onSoundsEnabledChange,
}: {
  soundsEnabled: boolean;
  onSoundsEnabledChange: (enabled: boolean) => void;
}) {
  const { setCalc, setMainTab } = useGalana();
  const [messages, setMessages] = useState<ChatApiMessage[]>([
    {
      role: "assistant",
      content:
        "Ask a short question — for example concrete pipes, paving coverage, roofing allowances, delivery, or how to **Request quote**. I summarise from our published info; firm pricing needs a formal quote or WhatsApp.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamVisible, setStreamVisible] = useState("");
  const [lastSuggestion, setLastSuggestion] =
    useState<SuggestedCalculatorPayload | null>(null);
  const [sessionId] = useState(() => newSessionId());
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [messages, streamVisible, busy]);

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
  }, [busy, input, messages, sessionId]);

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

      <header className="assistant-header">
        <h2 className="assistant-header-title">Galana assistant</h2>
        <p className="assistant-header-lead">
          Quick answers about products, site support, and estimate guidance. For official
          numbers or a formal quote, use <strong>Request quote</strong> or WhatsApp.
        </p>
      </header>

      <div className="help-chat-log assistant-log" ref={logRef}>
        {messages.map((m, i) => (
          <div
            key={`msg-${m.role}-${i}-${m.content.length}-${m.content.slice(0, 16)}`}
            className={`help-msg ${m.role === "user" ? "user" : "bot assistant-md"}`}
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

      <div className="help-chat-input-row assistant-input-row">
        <input
          type="text"
          placeholder="Ask about materials or quoting…"
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
