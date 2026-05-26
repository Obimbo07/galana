"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGalana } from "@/providers/galana-provider";
import type { SiteData } from "@/types/site-data";

type CatalogProduct = SiteData["products"][number];

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function scoreMatch(p: CatalogProduct, q: string): number {
  const n = normalize(p.name);
  const c = normalize(p.catLabel ?? "");
  const u = normalize(p.use ?? "");
  if (n.startsWith(q)) return 3;
  if (n.includes(q)) return 2;
  if (c.includes(q)) return 1.5;
  if (u.includes(q)) return 1;
  return 0;
}

export function NavSearch() {
  const { data } = useGalana();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const deferred = useDeferredValue(query);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const results = useMemo(() => {
    const q = normalize(deferred);
    if (q.length < 2) return [] as CatalogProduct[];
    const scored = data.products
      .map((p) => ({ p, s: scoreMatch(p, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.p);
    return scored;
  }, [data.products, deferred]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      router.push(`/products?q=${encodeURIComponent(t)}`);
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    },
    [router]
  );

  const showPanel = open && deferred.trim().length >= 2;

  return (
    <div className="nav-search" ref={wrapRef}>
      <form
        role="search"
        className="nav-search-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <span className="nav-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          className="nav-search-input"
          placeholder="Search products, categories…"
          aria-label="Search products"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />
        {query ? (
          <button
            type="button"
            className="nav-search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div className="nav-search-panel" id={listboxId} role="listbox">
          {results.length === 0 ? (
            <div className="nav-search-empty">
              No matches for <strong>“{deferred}”</strong>. Try a category like
              <button
                type="button"
                className="nav-search-chip"
                onClick={() => submit("paving")}
              >
                paving
              </button>
              or
              <button
                type="button"
                className="nav-search-chip"
                onClick={() => submit("pipes")}
              >
                pipes
              </button>
              .
            </div>
          ) : (
            <ul className="nav-search-results">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products?q=${encodeURIComponent(p.name)}`}
                    className="nav-search-result"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    role="option"
                    aria-selected="false"
                  >
                    <span className="nav-search-thumb" aria-hidden="true">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                    <span className="nav-search-meta">
                      <span className="nav-search-name">{p.name}</span>
                      <span className="nav-search-cat">{p.catLabel}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="nav-search-all"
                  onClick={() => submit(query)}
                >
                  See all results for “{deferred}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
