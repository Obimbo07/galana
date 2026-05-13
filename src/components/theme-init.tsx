"use client";

import { useLayoutEffect } from "react";
import { syncGalanaThemeFromStorage } from "@/lib/galana-theme";

/**
 * Applies persisted theme before paint when possible.
 * `localStorage['galana_theme']`: `light` | `dark` | `system` (or unset).
 * - `light` / `dark` set `data-theme` on `<html>` (overrides `prefers-color-scheme`).
 * - `system` clears `data-theme` so CSS follows the OS.
 */
export function ThemeInit() {
  useLayoutEffect(() => {
    syncGalanaThemeFromStorage();
  }, []);
  return null;
}
