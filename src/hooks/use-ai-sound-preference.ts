"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  AI_SOUND_PREF_KEY,
  getAiSoundsEnabled,
  setAiSoundsEnabled as persistAiSoundsEnabled,
} from "@/lib/ai-assistant-sfx";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === AI_SOUND_PREF_KEY || e.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return getAiSoundsEnabled();
}

function getServerSnapshot() {
  return false;
}

export function useAiSoundPreference() {
  const soundsEnabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setSoundsEnabled = useCallback((next: boolean) => {
    persistAiSoundsEnabled(next);
    emit();
  }, []);

  return { soundsEnabled, setSoundsEnabled };
}
