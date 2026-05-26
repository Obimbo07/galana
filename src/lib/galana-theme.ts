export type GalanaThemeChoice = "system" | "light" | "dark";
export type GalanaResolvedTheme = "light" | "dark";

export const GALANA_THEME_STORAGE_KEY = "galana-theme";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readSystemPreference(): GalanaResolvedTheme {
  if (!isBrowser()) return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveGalanaTheme(
  choice: GalanaThemeChoice
): GalanaResolvedTheme {
  return choice === "system" ? readSystemPreference() : choice;
}

export function readStoredGalanaTheme(): GalanaThemeChoice {
  if (!isBrowser()) return "system";

  try {
    const stored = window.localStorage.getItem(GALANA_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore storage errors and fall back to the system theme.
  }

  return "system";
}

function applyResolvedTheme(theme: GalanaResolvedTheme): void {
  if (!isBrowser()) return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function applyGalanaTheme(choice: GalanaThemeChoice): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(GALANA_THEME_STORAGE_KEY, choice);
  } catch {
    // Storage is optional.
  }

  applyResolvedTheme(resolveGalanaTheme(choice));
  window.dispatchEvent(new Event("galana-theme-change"));
}

export function bootstrapGalanaTheme(): string {
  return `(() => {
    try {
      const storageKey = ${JSON.stringify(GALANA_THEME_STORAGE_KEY)};
      const root = document.documentElement;
      const stored = window.localStorage.getItem(storageKey);
      const resolved = stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    } catch {
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light';
    }
  })();`;
}

export function subscribeGalanaTheme(onStoreChange: () => void): () => void {
  if (!isBrowser()) return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === GALANA_THEME_STORAGE_KEY) onStoreChange();
  };
  const onThemeChange = () => onStoreChange();
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (readStoredGalanaTheme() === "system") onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("galana-theme-change", onThemeChange);
  media?.addEventListener?.("change", onMedia);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("galana-theme-change", onThemeChange);
    media?.removeEventListener?.("change", onMedia);
  };
}
