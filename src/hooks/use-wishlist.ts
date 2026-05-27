"use client";

import { useCallback, useEffect, useState } from "react";

const LS_KEY = "galana-wishlist";

function readStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readStored());
    const onChange = () => setIds(readStored());
    listeners.add(onChange);
    window.addEventListener("storage", (e) => {
      if (e.key === LS_KEY) onChange();
    });
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const current = readStored();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    notify();
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, has, toggle, count: ids.length };
}
