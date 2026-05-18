"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useGalana } from "@/providers/galana-provider";
import type { SiteData } from "@/types/site-data";

type CatalogProduct = SiteData["products"][number];

const EMPTY_CATALOG: CatalogProduct[] = [];

function formatPriceKes(n: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function hasListedPrice(price: unknown): price is number {
  return typeof price === "number" && Number.isFinite(price) && price >= 0;
}

const FILTERS: Array<[string, string]> = [
  ["all", "All Products"],
  ["pipes", "Concrete Pipes"],
  ["precast", "Precast"],
  ["paving", "Paving Blocks"],
  ["roofing", "Roof Tiles"],
];

function filterCatalog(products: CatalogProduct[], cat: string): CatalogProduct[] {
  const list = products ?? [];
  return cat === "all" ? list : list.filter((p) => p.cat === cat);
}

function ProductCard({
  p,
  index,
}: {
  p: CatalogProduct;
  index: number;
}) {
  const { addToCart } = useGalana();

  const staggerStyle = {
    ["--reveal-i" as string]: String(index),
  } as CSSProperties;

  return (
    <article
      className="product-card reveal reveal-stagger-item"
      data-cat={p.cat}
      data-product-id={p.id}
      style={staggerStyle}
    >
      <div className="product-img-wrap">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width: 900px) 82vw, 280px"
          className="object-cover"
        />
        <div className="product-overlay">
          <div className="product-overlay-btn">View Details →</div>
        </div>
      </div>
      <div className="product-info">
        <div className="product-cat-badge">{p.catLabel}</div>
        <div className="product-name">{p.name}</div>
        {hasListedPrice(p.price) ? (
          <div className="product-price">{formatPriceKes(p.price)}</div>
        ) : (
          <div className="product-price product-price-muted">Price on request</div>
        )}
        <div className="product-use">{p.use}</div>
      </div>
      <div className="product-add-wrap">
        <button
          type="button"
          className="product-add"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(p);
          }}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

export function ProductsSection() {
  const { data } = useGalana();
  const embedded = data.products ?? EMPTY_CATALOG;

  const [cat, setCat] = useState("all");
  const [items, setItems] = useState<CatalogProduct[]>(() =>
    filterCatalog(embedded, "all")
  );
  const [syncing, setSyncing] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const fetchForCat = useCallback(
    async (nextCat: string, signal: AbortSignal) => {
      const qs =
        nextCat === "all" ? "" : `?cat=${encodeURIComponent(nextCat)}`;
      const res = await fetch(`/api/products${qs}`, {
        cache: "no-store",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { products?: CatalogProduct[] };
      return Array.isArray(body.products) ? body.products : [];
    },
    []
  );

  useEffect(() => {
    const optimistic = filterCatalog(embedded, cat);
    setItems(optimistic);

    const ac = new AbortController();
    setSyncing(true);

    fetchForCat(cat, ac.signal)
      .then((remote) => {
        setItems(remote);
      })
      .catch((err: unknown) => {
        const name =
          err && typeof err === "object" && "name" in err
            ? String((err as { name?: string }).name)
            : "";
        if (name === "AbortError") return;
        setItems(optimistic);
      })
      .finally(() => {
        if (!ac.signal.aborted) setSyncing(false);
      });

    return () => ac.abort();
  }, [cat, embedded, fetchForCat]);

  useEffect(() => {
    viewportRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [cat, items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      {
        threshold: 0,
        rootMargin: "100px 0px 140px 0px",
        root: null,
      }
    );

    track.querySelectorAll(".product-card.reveal").forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [items]);

  const scrollCarousel = useCallback((dir: -1 | 1) => {
    const el = viewportRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientWidth * 0.82));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const empty = items.length === 0;

  const carouselLabel = useMemo(() => {
    const label = FILTERS.find(([id]) => id === cat)?.[1] ?? "Products";
    return `${label} carousel`;
  }, [cat]);

  return (
    <section id="products">
      <div className="section-inner">
        <div className="section-tag reveal">Product Catalog</div>
        <h2 className="section-title reveal reveal-delay-1">
          Built for Every <em>Project</em>
        </h2>
        <p className="section-sub reveal reveal-delay-2">
          42+ product types across 4 categories — all manufactured in-house,
          all KEBS certified, all ready to deliver across East Africa.
        </p>
        <div
          className="products-filter reveal reveal-delay-3"
          id="productsFilter"
          role="tablist"
          aria-label="Product categories"
        >
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={cat === id}
              className={`filter-btn${cat === id ? " active" : ""}`}
              onClick={() => setCat(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {syncing ? (
          <p className="products-sync-hint" aria-live="polite">
            Updating catalog…
          </p>
        ) : null}

        <div className="products-carousel-wrap reveal reveal-delay-3">
          <button
            type="button"
            className="products-carousel-arrow products-carousel-arrow-prev"
            aria-label="Scroll products left"
            onClick={() => scrollCarousel(-1)}
          >
            ‹
          </button>
          <div
            ref={viewportRef}
            className="products-carousel-viewport"
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={carouselLabel}
          >
            <div ref={trackRef} className="products-carousel-track">
              {empty ? (
                <p className="products-carousel-empty">
                  No products in this category.
                </p>
              ) : (
                items.map((p, i) => (
                  <div key={p.id} className="products-carousel-slide">
                    <ProductCard p={p} index={i} />
                  </div>
                ))
              )}
            </div>
          </div>
          <button
            type="button"
            className="products-carousel-arrow products-carousel-arrow-next"
            aria-label="Scroll products right"
            onClick={() => scrollCarousel(1)}
          >
            ›
          </button>
        </div>

        <div
          style={{ textAlign: "center", marginTop: "2.5rem" }}
          className="reveal reveal-delay-4"
        >
          <Link href="/#contact" className="btn-outline">
            Request Full Catalog →
          </Link>
        </div>
      </div>
    </section>
  );
}
