import type { SVGProps } from "react";

function AssistantGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2zm0 14H5.17L4 17.17V4h16v12z"
      />
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
