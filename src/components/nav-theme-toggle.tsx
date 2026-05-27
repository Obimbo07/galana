"use client";

import {
  applyGalanaTheme,
  type GalanaThemeChoice,
  readStoredGalanaTheme,
  subscribeGalanaTheme,
} from "@/lib/galana-theme";
import { useSyncExternalStore } from "react";

const ORDER: GalanaThemeChoice[] = ["system", "light", "dark"];
const LABELS: Record<GalanaThemeChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function NavThemeToggle({ onChoice }: { onChoice?: () => void }) {
  const choice = useSyncExternalStore(
    subscribeGalanaTheme,
    readStoredGalanaTheme,
    () => "system"
  );

  function cycle() {
    const idx = ORDER.indexOf(choice as GalanaThemeChoice);
    const next = ORDER[(idx + 1) % ORDER.length] ?? "system";
    applyGalanaTheme(next);
    onChoice?.();
  }

  const next = ORDER[(ORDER.indexOf(choice as GalanaThemeChoice) + 1) % ORDER.length] ?? "system";

  return (
    <button
      type="button"
      className={`nav-theme-toggle nav-theme-toggle-${choice}`}
      onClick={cycle}
      aria-label={`Theme: ${LABELS[choice as GalanaThemeChoice]}. Switch to ${LABELS[next]}.`}
      title={`Theme: ${LABELS[choice as GalanaThemeChoice]} (click for ${LABELS[next]})`}
    >
      <span className="nav-theme-toggle-icon" aria-hidden="true">
        {choice === "light" ? (
          // sun
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : choice === "dark" ? (
          // moon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // system (monitor)
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
          </svg>
        )}
      </span>
    </button>
  );
}
