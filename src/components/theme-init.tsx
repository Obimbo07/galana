"use client";

import { useLayoutEffect } from "react";
import {
  applyGalanaTheme,
  readStoredGalanaTheme,
  resolveGalanaTheme,
} from "@/lib/galana-theme";

export function ThemeInit() {
  useLayoutEffect(() => {
    const choice = readStoredGalanaTheme();
    applyGalanaTheme(choice);
    document.documentElement.dataset.theme = resolveGalanaTheme(choice);
  }, []);

  return null;
}
