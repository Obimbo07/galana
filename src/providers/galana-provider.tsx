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
import type { SiteQuotePayload } from "@/types/galana-firestore";
import { useRouter } from "next/navigation";

const LS_EMAILS = "galana_quote_emails";
const LS_QUOTE_CONTACT = "galana_quote_contact_v1";

export type PostQuoteExtras = Partial<
  Pick<
    SiteQuotePayload,
    | "fullName"
    | "company"
    | "location"
    | "fromPhone"
    | "fromEmail"
    | "inquiryCategory"
    | "inquiryMessage"
    | "source"
  >
>;

export type PostQuoteResult =
  | { ok: true; id: string | null }
  | { ok: false; message: string };

export async function downloadQuotePdfClient(quoteId: string): Promise<void> {
  const r = await fetch(
    `/api/quote/pdf?id=${encodeURIComponent(quoteId)}`,
    { method: "GET" }
  );
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(
      (j && typeof j.message === "string" && j.message) ||
        "Could not download PDF."
    );
  }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `galana-quote-${quoteId.slice(0, 12)}.pdf`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

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
  quotePhone: string;
  setQuotePhone: (e: string) => void;
  quoteLocation: string;
  setQuoteLocation: (e: string) => void;
  quotePanelOpen: boolean;
  setQuotePanelOpen: (v: boolean) => void;
  quoteBody: string;
  recentEmails: string[];
  rememberEmail: (addr: string) => void;

  openMailtoQuote: () => void;
  postQuoteApi: (extras?: PostQuoteExtras) => Promise<PostQuoteResult>;
  downloadQuotePdf: (quoteId: string) => Promise<void>;

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
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteLocation, setQuoteLocation] = useState("");
  const [quotePanelOpen, setQuotePanelOpen] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [applyModalTitle, setApplyModalTitle] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(LS_EMAILS);
        if (raw) setRecentEmails(JSON.parse(raw) as string[]);
        const qc = localStorage.getItem(LS_QUOTE_CONTACT);
        if (qc) {
          const o = JSON.parse(qc) as {
            phone?: string;
            location?: string;
          };
          if (typeof o.phone === "string") setQuotePhone(o.phone);
          if (typeof o.location === "string") setQuoteLocation(o.location);
        }
      } catch {
        /* ignore */
      }
    });
  }, []);

  const persistQuoteContact = useCallback((phone: string, location: string) => {
    try {
      localStorage.setItem(
        LS_QUOTE_CONTACT,
        JSON.stringify({ phone, location })
      );
    } catch {
      /* ignore */
    }
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
      phone: quotePhone.trim(),
      location: quoteLocation.trim(),
      fields: calc,
      activeMainTab: mainTab,
      cart: cartPayload,
    });
  }, [quoteEmail, quotePhone, quoteLocation, calc, mainTab, cartPayload]);

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
        phone: quotePhone.trim(),
        location: quoteLocation.trim(),
        fields: calc,
        activeMainTab: mainTab,
        cart: cartPayload,
      })
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }, [quoteEmail, quotePhone, quoteLocation, rememberEmail, data.contact, calc, mainTab, cartPayload]);

  const postQuoteApi = useCallback(
    async (extras?: PostQuoteExtras): Promise<PostQuoteResult> => {
      const email = (extras?.fromEmail ?? quoteEmail).trim();
      rememberEmail(email);
      const phone = (extras?.fromPhone ?? quotePhone).trim();
      const location = (extras?.location ?? quoteLocation).trim();
      persistQuoteContact(phone, location);

      // Calculate total price from calculator results and cart
      let totalPrice = 0;

      // Paving
      if (pavingResult) {
        const pavingOption = data.calculator.paving.blocksPerM2Options.find(
          (o) => o.blocksPerM2 === calc.pavingBlocksPerM2
        );
        if (pavingOption) {
          const productId = `pav-${pavingOption.id}`;
          const product = data.products.find((p) => p.id === productId);
          if (product && product.price !== undefined) {
            const quantityMatch = pavingResult.value.match(/^([\d,]+)/);
            if (quantityMatch) {
              const quantity = parseInt(quantityMatch[1].replace(/,/g, ''), 10);
              totalPrice += quantity * product.price;
            }
          }
        }
      }

      // Pipes
      if (pipeResult) {
        const pipeOption = data.calculator.pipes.pipeTypes.find(
          (o) => o.sectionM === calc.pipeSectionM
        );
        if (pipeOption) {
          const productId = `pipe-${pipeOption.id}`;
          const product = data.products.find((p) => p.id === productId);
          if (product && product.price !== undefined) {
            const quantityMatch = pipeResult.value.match(/^([\d,]+)/);
            if (quantityMatch) {
              const quantity = parseInt(quantityMatch[1].replace(/,/g, ''), 10);
              totalPrice += quantity * product.price;
            }
          }
        }
      }

      // Roofing
      if (roofResult) {
        const roofingOption = data.calculator.roofing.tileTypes.find(
          (o) => o.tilesPerM2 === calc.roofTilesPerM2
        );
        if (roofingOption) {
          const productId = `roof-${roofingOption.id}`;
          const product = data.products.find((p) => p.id === productId);
          if (product && product.price !== undefined) {
            const quantityMatch = roofResult.value.match(/^([\d,]+)/);
            if (quantityMatch) {
              const quantity = parseInt(quantityMatch[1].replace(/,/g, ''), 10);
              totalPrice += quantity * product.price;
            }
          }
        }
      }

      // Cart items
      for (const cartLine of cartPayload) {
        const product = data.products.find((p) => p.id === cartLine.productId);
        if (product && product.price !== undefined) {
          totalPrice += cartLine.qty * product.price;
        }
      }

      const payload: SiteQuotePayload = {
        fromEmail: email,
        fromPhone: phone || undefined,
        location: location || undefined,
        fullName: extras?.fullName?.trim() || undefined,
        company: extras?.company?.trim() || undefined,
        inquiryCategory: extras?.inquiryCategory?.trim() || undefined,
        inquiryMessage: extras?.inquiryMessage?.trim() || undefined,
        source: extras?.source,
        calculator: {
          lines: (
            [
              pavingResult &&
                `[Paving] ${pavingResult.value} — ${pavingResult.note}`,
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
          body: JSON.stringify({ payload, totalPrice }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          return {
            ok: false,
            message:
              (j && j.message) ||
              "Quote API is not configured or returned an error. Set FIREBASE_SERVICE_ACCOUNT_JSON and/or QUOTE_API_URL in .env (see .env.example).",
          };
        }
        const id =
          j && typeof j === "object" && j.id != null ? String(j.id) : null;
        
        // If we have a quote ID, redirect to payment page after PDF download
        if (id) {
          try {
            await downloadQuotePdf(id);
            window.alert(
              `Quote saved (reference ${id}). Your PDF download should start.`
            );
            // Redirect to payment page
            router.push(`/pay/${id}`);
          } catch (e) {
            window.alert(
              e instanceof Error
                ? e.message
                : "PDF download failed. The quote is still saved."
            );
            // Still redirect to payment page even if PDF download fails
            router.push(`/pay/${id}`);
          }
        } else {
          window.alert(
            "Quote was accepted but not stored — add FIREBASE_SERVICE_ACCOUNT_JSON in .env so we can save an ID and build your PDF."
          );
        }
        
        return { ok: true, id };
      } catch {
        return {
          ok: false,
          message:
            "Could not reach quote API. Check Firestore / QUOTE_API_URL, network, and server logs.",
        };
      }
    },
    [
      quoteEmail,
      quotePhone,
      quoteLocation,
      rememberEmail,
      persistQuoteContact,
      pavingResult,
      pipeResult,
      roofResult,
      mainTab,
      cartPayload,
      data, // Need to add data to dependencies
      calc, // Need to add calc to dependencies
      router // Add router to dependencies
    ]
  );

  const downloadQuotePdf = useCallback(async (quoteId: string) => {
    await downloadQuotePdfClient(quoteId);
  }, []);

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
    quotePhone,
    setQuotePhone,
    quoteLocation,
    setQuoteLocation,
    quotePanelOpen,
    setQuotePanelOpen,
    quoteBody,
    recentEmails,
    rememberEmail,
    openMailtoQuote,
    postQuoteApi,
    downloadQuotePdf,
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
