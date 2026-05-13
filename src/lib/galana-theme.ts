export const GALANA_THEME_STORAGE_KEY = "galana_theme";

export type GalanaThemeChoice = "system" | "light" | "dark";

type ThemeListener = () => void;
const themeListeners = new Set<ThemeListener>();

export function subscribeGalanaTheme(listener: ThemeListener): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function emitGalanaThemeChange(): void {
  themeListeners.forEach((fn) => fn());
}

export function readStoredGalanaTheme(): GalanaThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const raw = localStorage.getItem(GALANA_THEME_STORAGE_KEY)?.trim().toLowerCase();
    if (raw === "light" || raw === "dark") return raw;
    return "system";
  } catch {
    return "system";
  }
}

/**
 * Persist choice and sync `<html data-theme>`.
 * `system` sets `localStorage['galana_theme']` to `system` and removes `data-theme`.
 */
export function applyGalanaTheme(choice: GalanaThemeChoice): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  try {
    if (choice === "system") {
      localStorage.setItem(GALANA_THEME_STORAGE_KEY, "system");
      root.removeAttribute("data-theme");
    } else {
      localStorage.setItem(GALANA_THEME_STORAGE_KEY, choice);
      root.setAttribute("data-theme", choice);
    }
  } catch {
    root.removeAttribute("data-theme");
  }
  emitGalanaThemeChange();
}

export function syncGalanaThemeFromStorage(): void {
  const choice = readStoredGalanaTheme();
  if (choice === "light") document.documentElement.setAttribute("data-theme", "light");
  else if (choice === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
}
