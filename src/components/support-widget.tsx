"use client";

import { useCallback, useEffect, useState } from "react";
import { AiAssistantFab } from "@/components/ai-assistant-fab";
import { AssistantChat } from "@/components/assistant-chat";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { useAiSoundPreference } from "@/hooks/use-ai-sound-preference";
import { tryPlayAiAssistantChime } from "@/lib/ai-assistant-sfx";
import type { SiteData } from "@/types/site-data";

const ASSISTANT_PANEL_ID = "helpAssistantPanel";

export function SupportWidget({ data }: { data: SiteData }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { soundsEnabled, setSoundsEnabled } = useAiSoundPreference();

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
    if (!assistantOpen) return;
    tryPlayAiAssistantChime();
  }, [assistantOpen, soundsEnabled]);

  const setAssistantSoundsEnabled = useCallback(
    (next: boolean) => {
      setSoundsEnabled(next);
      if (next) tryPlayAiAssistantChime();
    },
    [setSoundsEnabled]
  );

  return (
    <div className="help-fab-wrap" id="helpFabWrap">
      <div
        className={`help-panel${assistantOpen ? " open" : ""}`}
        id={ASSISTANT_PANEL_ID}
        aria-hidden={!assistantOpen}
        aria-live="polite"
      >
        <div className="help-panel-head help-panel-head-row" id="helpPanelHead">
          <span>AI assistant</span>
          <button
            type="button"
            className="help-panel-close"
            aria-label="Close AI assistant"
            onClick={() => setAssistantOpen(false)}
          >
            ×
          </button>
        </div>
        <AssistantChat
          soundsEnabled={soundsEnabled}
          onSoundsEnabledChange={setAssistantSoundsEnabled}
        />
      </div>

      <div className="help-fab-stack">
        <AiAssistantFab
          open={assistantOpen}
          onOpenChange={setAssistantOpen}
          panelId={ASSISTANT_PANEL_ID}
        />
        <WhatsAppFab href={waHref} configured={Boolean(digits)} />
      </div>
    </div>
  );
}
