export const AI_CHIME_SRC = "/sounds/ai-chime.wav";

export const AI_CHIME_SESSION_KEY = "galana_ai_chimePlayed";

/** When `'1'`, UI sounds are enabled. Default (missing key) = muted / off. */
export const AI_SOUND_PREF_KEY = "galana_ai_sounds_enabled";

export function getAiSoundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AI_SOUND_PREF_KEY) === "1";
}

export function setAiSoundsEnabled(enabled: boolean): void {
  window.localStorage.setItem(AI_SOUND_PREF_KEY, enabled ? "1" : "0");
}

/**
 * Low-key panel open chime: once per browser session while sounds are enabled.
 */
export function tryPlayAiAssistantChime(): void {
  if (typeof window === "undefined") return;
  if (!getAiSoundsEnabled()) return;
  if (window.sessionStorage.getItem(AI_CHIME_SESSION_KEY) === "1") return;
  window.sessionStorage.setItem(AI_CHIME_SESSION_KEY, "1");
  const audio = new Audio(AI_CHIME_SRC);
  audio.volume = 0.26;
  void audio.play().catch(() => {});
}
