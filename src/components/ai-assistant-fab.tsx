import type { SVGProps } from "react";

function AssistantGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden {...props}>
      <rect x="4" y="3" width="16" height="12" rx="3" fill="currentColor" />
      <polygon points="9 15 8 20 13 15" fill="currentColor" />
      <circle cx="9" cy="9" r="1" fill="#FFFFFF" />
      <circle cx="12" cy="9" r="1" fill="#FFFFFF" />
      <circle cx="15" cy="9" r="1" fill="#FFFFFF" />
    </svg>
  );
}

export function AiAssistantFab({
  open,
  onOpenChange,
  panelId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  panelId: string;
}) {
  return (
    <button
      type="button"
      className="help-fab-ai"
      id="helpFabAi"
      title="Galana AI assistant"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      onClick={() => onOpenChange(!open)}
    >
      <AssistantGlyph />
    </button>
  );
}
