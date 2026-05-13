"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SiteData } from "@/types/site-data";
import type { CalcFields, CalcTab } from "@/lib/calculator-math";
import {
  computePaving,
  computePipes,
  computeRoof,
} from "@/lib/calculator-math";
import {
  buildQuoteBody,
  type CartPayloadLine,
} from "@/lib/quote-body";

const LS_EMAILS = "galana_quote_emails";

export interface CartLine {
  id: string;
  name: string;
  catLabel: string;
  qty: number;
  note: string;
}

function initialCalc(data: SiteData): CalcFields {
  const c = data.calculator;
  return {
    pavingLength: "",
    pavingWidth: "",
    pavingBlocksPerM2:
      c.paving.blocksPerM2Options[0]?.blocksPerM2 ?? 40,
    pavingWaste: String(c.paving.defaultWastagePercent),
    pipeLength: "",
    pipeSectionM: c.pipes.pipeTypes[0]?.sectionM ?? 2.5,
    pipeExtra: String(c.pipes.defaultExtraPercent),
    roofArea: "",
    roofTilesPerM2: c.roofing.tileTypes[0]?.tilesPerM2 ?? 12,
    roofWaste: String(c.roofing.defaultWastagePercent),
  };
}

interface GalanaCtx {
  data: SiteData;
  cartLines: CartLine[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (p: SiteData["products"][number]) => void;
  setQty: (id: string, qty: number | string) => void;
  setLineNote: (id: string, note: string) => void;
  removeLine: (id: string) => void;
  cartCount: number;

  calc: CalcFields;
  setCalc: (patch: Partial<CalcFields>) => void;
  heroTab: CalcTab;
  setHeroTab: (t: CalcTab) => void;
  mainTab: CalcTab;
  setMainTab: (t: CalcTab) => void;

  pavingResult: ReturnType<typeof computePaving>;
  pipeResult: ReturnType<typeof computePipes>;
  roofResult: ReturnType<typeof computeRoof>;

  quoteEmail: string;
  setQuoteEmail: (e: string) => void;
  quotePanelOpen: boolean;
  setQuotePanelOpen: (v: boolean) => void;
  quoteBody: string;
  recentEmails: string[];
  rememberEmail: (addr: string) => void;

  openMailtoQuote: () => void;
  postQuoteApi: () => Promise<void>;

  scrollToCalculatorAndOpenQuote: () => void;

  applyModalTitle: string | null;
  openApplyModal: (jobKey: string) => void;
  closeApplyModal: () => void;
}

const Ctx = createContext<GalanaCtx | null>(null);

export function GalanaProvider({
  data,
  children,
}: {
  data: SiteData;
  children: React.ReactNode;
}) {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [calc, setCalcState] = useState(() => initialCalc(data));
  const [heroTab, setHeroTab] = useState<CalcTab>("paving");
  const [mainTab, setMainTab] = useState<CalcTab>("paving");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quotePanelOpen, setQuotePanelOpen] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [applyModalTitle, setApplyModalTitle] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(LS_EMAILS);
        if (raw) setRecentEmails(JSON.parse(raw) as string[]);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const setCalc = useCallback((patch: Partial<CalcFields>) => {
    setCalcState((prev) => ({ ...prev, ...patch }));
  }, []);

  const pavingResult = useMemo(() => computePaving(calc), [calc]);
  const pipeResult = useMemo(() => computePipes(calc), [calc]);
  const roofResult = useMemo(() => computeRoof(calc), [calc]);

  const cartPayload: CartPayloadLine[] = useMemo(
    () =>
      cartLines.map((l) => ({
        productId: l.id,
        name: l.name,
        category: l.catLabel,
        qty: l.qty,
        lineNote: l.note || "",
      })),
    [cartLines]
  );

  const quoteBody = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildQuoteBody({
      pageUrl: window.location.href,
      email: quoteEmail.trim(),
      fields: calc,
      activeMainTab: mainTab,
      cart: cartPayload,
    });
  }, [quoteEmail, calc, mainTab, cartPayload]);

  const rememberEmail = useCallback((addr: string) => {
    if (!addr || !addr.includes("@")) return;
    let list: string[] = [];
    try {
      list = JSON.parse(localStorage.getItem(LS_EMAILS) || "[]");
    } catch {
      list = [];
    }
    list = [addr, ...list.filter((x) => x !== addr)].slice(0, 12);
    localStorage.setItem(LS_EMAILS, JSON.stringify(list));
    setRecentEmails(list);
  }, []);

  const cartCount = useMemo(
    () => cartLines.reduce((s, l) => s + l.qty, 0),
    [cartLines]
  );

  const addToCart = useCallback((p: SiteData["products"][number]) => {
    setCartLines((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          catLabel: p.catLabel,
          qty: 1,
          note: "",
        },
      ];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number | string) => {
    const q = Math.max(1, parseInt(String(qty), 10) || 1);
    setCartLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: q } : l))
    );
  }, []);

  const setLineNote = useCallback((id: string, note: string) => {
    setCartLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, note } : l))
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setCartLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const openMailtoQuote = useCallback(() => {
    const email = quoteEmail.trim();
    rememberEmail(email);
    const to = data.contact?.quoteEmail || "info@galanagroup.co.ke";
    const subject = encodeURIComponent("Quote request — Galana Group");
    const body = encodeURIComponent(
      buildQuoteBody({
        pageUrl:
          typeof window !== "undefined"
            ? window.location.href
            : "",
        email,
        fields: calc,
        activeMainTab: mainTab,
        cart: cartPayload,
      })
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }, [quoteEmail, rememberEmail, data.contact, calc, mainTab, cartPayload]);

  const postQuoteApi = useCallback(async () => {
    const email = quoteEmail.trim();
    rememberEmail(email);
    const payload = {
      fromEmail: email,
      calculator: {
        lines: (
          [
            pavingResult && `[Paving] ${pavingResult.value} — ${pavingResult.note}`,
            pipeResult &&
              `[Drainage pipes] ${pipeResult.value} — ${pipeResult.note}`,
            roofResult &&
              `[Roof tiles] ${roofResult.value} — ${roofResult.note}`,
          ] as string[]
        ).filter(Boolean),
        activeMainTab: mainTab,
      },
      cart: cartPayload,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      const r = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        window.alert(
          (j && j.message) ||
            "Quote API is not configured or returned an error. Set QUOTE_API_URL in .env (see .env.example)."
        );
        return;
      }
      window.alert("Quote request submitted. Thank you.");
    } catch {
      window.alert(
        "Could not reach quote API. Check QUOTE_API_URL, network, and server logs."
      );
    }
  }, [
    quoteEmail,
    rememberEmail,
    pavingResult,
    pipeResult,
    roofResult,
    mainTab,
    cartPayload,
  ]);

  const scrollToCalculatorAndOpenQuote = useCallback(() => {
    const el = document.getElementById("calculator");
    el?.scrollIntoView({ behavior: "smooth" });
    setQuotePanelOpen(true);
    setCartOpen(false);
  }, []);

  const openApplyModal = useCallback((jobKey: string) => {
    setApplyModalTitle(
      jobKey === "general" ? "Open Application" : `Apply: ${jobKey}`
    );
  }, []);

  const closeApplyModal = useCallback(() => setApplyModalTitle(null), []);

  const value: GalanaCtx = {
    data,
    cartLines,
    cartOpen,
    setCartOpen,
    addToCart,
    setQty,
    setLineNote,
    removeLine,
    cartCount,
    calc,
    setCalc,
    heroTab,
    setHeroTab,
    mainTab,
    setMainTab,
    pavingResult,
    pipeResult,
    roofResult,
    quoteEmail,
    setQuoteEmail,
    quotePanelOpen,
    setQuotePanelOpen,
    quoteBody,
    recentEmails,
    rememberEmail,
    openMailtoQuote,
    postQuoteApi,
    scrollToCalculatorAndOpenQuote,
    applyModalTitle,
    openApplyModal,
    closeApplyModal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGalana() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGalana requires GalanaProvider");
  return v;
}
