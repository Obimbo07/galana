"use client";

import { useCallback, useEffect, useState } from "react";
import { AssistantChat } from "@/components/assistant-chat";
import { useAiSoundPreference } from "@/hooks/use-ai-sound-preference";
import { tryPlayAiAssistantChime } from "@/lib/ai-assistant-sfx";
import { faqAnswer } from "@/lib/faq-match";
import type { SiteData } from "@/types/site-data";

type HelpMode = "wa" | "assistant" | "faq";

export function SupportWidget({ data }: { data: SiteData }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<HelpMode>("wa");
  const { soundsEnabled, setSoundsEnabled } = useAiSoundPreference();
  const [faqLog, setFaqLog] = useState<
    Array<{ role: "user" | "bot"; text: string }>
  >([
    {
      role: "bot",
      text: "Ask about delivery, certification, products, or pricing. Short questions work best.",
    },
  ]);
  const [faqInput, setFaqInput] = useState("");

  const digits = String(data.contact?.whatsappDigits ?? "").replace(
    /\D/g,
    ""
  );
  const pre =
    data.help?.whatsappPrefill ??
    "Hello Galana Group — I have a question about materials / delivery.";
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(pre)}`
    : "#";

  useEffect(() => {
    if (!open || mode !== "assistant") return;
    tryPlayAiAssistantChime();
  }, [open, mode, soundsEnabled]);

  const setAssistantSoundsEnabled = useCallback(
    (next: boolean) => {
      setSoundsEnabled(next);
      if (next) tryPlayAiAssistantChime();
    },
    [setSoundsEnabled]
  );

  function sendFaq() {
    const t = faqInput.trim();
    if (!t) return;
    setFaqLog((prev) => [
      ...prev,
      { role: "user", text: t },
      { role: "bot", text: faqAnswer(data, t) },
    ]);
    setFaqInput("");
  }

  let panelHead = "WhatsApp";
  if (mode === "faq") panelHead = "Quick FAQ";
  if (mode === "assistant") panelHead = "AI assistant";

  return (
    <div className="help-fab-wrap" id="helpFabWrap">
      <div
        className={`help-panel${open ? " open" : ""}`}
        id="helpPanel"
        aria-live="polite"
      >
        <div className="help-panel-head" id="helpPanelHead">
          {panelHead}
        </div>

        {mode === "wa" ? (
          <>
            <div className="help-chat-log help-wa-body" id="helpChatLog">
              <div className="help-msg bot">
                Tap below to chat with us on WhatsApp — fastest for timelines,
                layouts, or site photos.
              </div>
            </div>
            <div className="help-chat-input-row" id="helpWaRow">
              <a
                className="btn-primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  textDecoration: "none",
                }}
                id="helpWaLink"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                title={digits ? undefined : "Set contact.whatsappDigits in JSON"}
              >
                Open WhatsApp
              </a>
            </div>
          </>
        ) : null}

        {mode === "faq" ? (
          <>
            <div className="help-chat-log" id="helpChatLog">
              {faqLog.map((m, i) => (
                <div
                  key={`${i}-${m.role}`}
                  className={`help-msg ${m.role === "bot" ? "bot" : "user"}`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="help-chat-input-row" id="helpChatInputRow">
              <input
                type="text"
                id="helpChatInput"
                placeholder="Keyword question…"
                autoComplete="off"
                value={faqInput}
                onChange={(e) => setFaqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendFaq();
                }}
              />
              <button type="button" id="helpChatSend" onClick={sendFaq}>
                Send
              </button>
            </div>
          </>
        ) : null}

        {mode === "assistant" ? (
          <AssistantChat
            data={data}
            soundsEnabled={soundsEnabled}
            onSoundsEnabledChange={setAssistantSoundsEnabled}
          />
        ) : null}
      </div>

      <div className="help-mode-toggle three" id="helpModeToggle">
        <button
          type="button"
          data-mode="wa"
          className={mode === "wa" ? "active" : ""}
          onClick={() => setMode("wa")}
        >
          WhatsApp
        </button>
        <button
          type="button"
          data-mode="assistant"
          className={mode === "assistant" ? "active" : ""}
          onClick={() => setMode("assistant")}
        >
          AI
        </button>
        <button
          type="button"
          data-mode="faq"
          className={mode === "faq" ? "active" : ""}
          onClick={() => setMode("faq")}
          title="Keyword FAQ"
        >
          FAQ
        </button>
      </div>

      <button
        type="button"
        className="help-fab-main"
        id="helpFabBtn"
        title="Help"
        aria-label="Open help"
        onClick={() => setOpen(!open)}
      >
        ?
      </button>
    </div>
  );
}
