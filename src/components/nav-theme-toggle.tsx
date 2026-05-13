"use client";

import {
  applyGalanaTheme,
  type GalanaThemeChoice,
  readStoredGalanaTheme,
  subscribeGalanaTheme,
} from "@/lib/galana-theme";
import { useSyncExternalStore } from "react";

export function NavThemeToggle({ onChoice }: { onChoice?: () => void }) {
  const choice = useSyncExternalStore(
    subscribeGalanaTheme,
    readStoredGalanaTheme,
    () => "system"
  );

  function pick(next: GalanaThemeChoice) {
    applyGalanaTheme(next);
    onChoice?.();
  }

  return (
    <div className="nav-theme" role="radiogroup" aria-label="Color theme">
      {(
        [
          ["system", "System"],
          ["light", "Light"],
          ["dark", "Dark"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={`nav-theme-btn${choice === value ? " nav-theme-btn-active" : ""}`}
          role="radio"
          aria-checked={choice === value}
          onClick={() => pick(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
