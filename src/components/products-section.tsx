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
import { catalogShuffleSeed, shuffleWithSeed } from "@/lib/catalog-shuffle";
import { useGalana } from "@/providers/galana-provider";
import type { SiteData } from "@/types/site-data";

export type ProductsSectionVariant = "home" | "store";

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

function isSaleProduct(p: CatalogProduct): boolean {
  if (p.badge === "sale") return true;
  const hi = p.compareAtPrice;
  const lo = p.price;
  return (
    typeof hi === "number" &&
    typeof lo === "number" &&
    Number.isFinite(hi) &&
    Number.isFinite(lo) &&
    hi > lo
  );
}

const FILTERS: Array<[string, string]> = [
  ["all", "All products"],
  ["pipes", "Drainage & pipes"],
  ["precast", "Precast"],
  ["paving", "Paving"],
  ["roofing", "Roof tiles"],
  ["vent", "Vent & breeze"],
  ["sinks", "Laundry sinks"],
];

const SHOP_CATEGORY_TILES: Array<{
  cat: string;
  title: string;
  blurb: string;
}> = [
  {
    cat: "pipes",
    title: "Drainage systems",
    blurb: "Pipes, culverts & access structures",
  },
  {
    cat: "precast",
    title: "Precast concrete",
    blurb: "Walls, channels, fencing & more",
  },
  {
    cat: "paving",
    title: "Paving & cabros",
    blurb: "Driveways, slabs & decorative paving",
  },
  {
    cat: "roofing",
    title: "Roof tiles",
    blurb: "Profiles & ridge accessories",
  },
  {
    cat: "vent",
    title: "Vent & breeze",
    blurb: "Louvers & decorative vents",
  },
  {
    cat: "sinks",
    title: "Laundry sinks",
    blurb: "Dhobi & terrazzo sinks",
  },
];

function filterCatalog(
  products: CatalogProduct[],
  cat: string
): CatalogProduct[] {
  const list = products ?? [];
  return cat === "all" ? list : list.filter((p) => p.cat === cat);
}

function ProductBadges({
  p,
  layout = "overlay",
}: {
  p: CatalogProduct;
  layout?: "overlay" | "inline";
}) {
  const sale = isSaleProduct(p);
  return (
    <div
      className={`product-badge-stack${layout === "inline" ? " product-badge-stack--inline" : ""}`}
      aria-hidden={layout === "overlay" ? true : undefined}
    >
      {p.badge === "new" ? (
        <span className="product-badge product-badge-new">New in</span>
      ) : null}
      {sale ? (
        <span className="product-badge product-badge-sale">Sale</span>
      ) : null}
      {p.badge === "featured" && !sale ? (
        <span className="product-badge product-badge-hot">Featured</span>
      ) : null}
    </div>
  );
}

function ProductPriceRow({ p }: { p: CatalogProduct }) {
  const sale = isSaleProduct(p);
  const hi = p.compareAtPrice;
  return (
    <div className="product-price-row">
      {hasListedPrice(p.price) ? (
        <span className="product-price">{formatPriceKes(p.price)}</span>
      ) : (
        <span className="product-price product-price-muted">
          Price on request
        </span>
      )}
      {sale && hasListedPrice(hi) ? (
        <span className="product-price-was">{formatPriceKes(hi)}</span>
      ) : null}
    </div>
  );
}

function ProductQuickViewDialog({
  product,
  onClose,
}: {
  product: CatalogProduct | null;
  onClose: () => void;
}) {
  const { addToCart } = useGalana();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    queueMicrotask(() => closeBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const sale = isSaleProduct(product);

  return (
    <div
      className="product-quick-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="product-quick-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-quick-title"
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="product-quick-close"
          aria-label="Close quick view"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="product-quick-layout">
          <div className="product-quick-visual">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover product-quick-img"
            />
            <div className="product-quick-visual-scrim" aria-hidden="true" />
          </div>

          <div className="product-quick-body">
            <div className="product-quick-meta">
              <span className="product-quick-sku">{product.catLabel}</span>
              <ProductBadges p={product} layout="inline" />
            </div>
            <h2 id="product-quick-title" className="product-quick-name">
              {product.name}
            </h2>
            <div className="product-quick-price-block">
              {hasListedPrice(product.price) ? (
                <span className="product-quick-price">
                  {formatPriceKes(product.price)}
                </span>
              ) : (
                <span className="product-quick-price product-quick-price-muted">
                  Price on request
                </span>
              )}
              {sale &&
              hasListedPrice(product.compareAtPrice) &&
              hasListedPrice(product.price) ? (
                <span className="product-quick-price-was">
                  {formatPriceKes(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <p className="product-quick-desc">{product.use}</p>
            {product.listingNote ? (
              <p className="product-quick-note">{product.listingNote}</p>
            ) : null}
            <div className="product-quick-actions">
              <button
                type="button"
                className="btn-primary product-quick-add"
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
              >
                Add to cart
              </button>
              <button
                type="button"
                className="btn-outline product-quick-dismiss"
                onClick={onClose}
              >
                Continue browsing
              </button>
            </div>
            {product.referenceUrl ? (
              <a
                href={product.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="product-quick-ref"
              >
                Open reference listing →
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  p,
  index,
  onQuickView,
}: {
  p: CatalogProduct;
  index: number;
  onQuickView?: () => void;
}) {
  const { addToCart } = useGalana();

  const staggerStyle = {
    ["--reveal-i" as string]: String(index),
  } as CSSProperties;

  return (
    <article
      className="product-card ecommerce-card reveal reveal-stagger-item"
      data-cat={p.cat}
      data-product-id={p.id}
      style={staggerStyle}
    >
      <ProductBadges p={p} />
      <div className="product-img-wrap">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width: 900px) 82vw, 280px"
          className="object-cover"
        />
        {onQuickView ? (
          <>
            <button
              type="button"
              className="product-overlay product-overlay--qv"
              aria-label={`Quick view ${p.name}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
            >
              <span className="product-overlay-btn">Quick view</span>
            </button>
            <button
              type="button"
              className="product-quick-chip"
              aria-label={`Quick view ${p.name}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
            >
              View
            </button>
          </>
        ) : (
          <div className="product-overlay" aria-hidden="true">
            <div className="product-overlay-btn">Quick view</div>
          </div>
        )}
      </div>
      <div className="product-info">
        <div className="product-cat-badge">{p.catLabel}</div>
        <h3 className="product-name">{p.name}</h3>
        <ProductPriceRow p={p} />
        <p className="product-use">{p.use}</p>
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

function ShopSpotlightPair({
  primary,
  secondary,
}: {
  primary: CatalogProduct;
  secondary: CatalogProduct;
}) {
  const { addToCart } = useGalana();

  function SpotlightInner({
    p,
    rank,
  }: {
    p: CatalogProduct;
    rank: "hero" | "side";
  }) {
    return (
      <div className={`shop-spotlight-inner shop-spotlight-inner--${rank}`}>
        <div className="shop-spotlight-media">
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes={rank === "hero" ? "(max-width:900px) 100vw, 55vw" : "320px"}
            className="object-cover shop-spotlight-img"
          />
          <ProductBadges p={p} />
        </div>
        <div className="shop-spotlight-copy">
          <p className="shop-spotlight-eyebrow">
            {rank === "hero" ? "Editor's pick" : "Also trending"}
          </p>
          <h3 className="shop-spotlight-title">{p.name}</h3>
          <p className="shop-spotlight-desc">{p.use}</p>
          <ProductPriceRow p={p} />
          <button
            type="button"
            className="btn-primary shop-spotlight-cta"
            onClick={() => addToCart(p)}
          >
            Add to cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-spotlight-grid reveal">
      <article className="shop-spotlight-card shop-spotlight-card--hero">
        <SpotlightInner p={primary} rank="hero" />
      </article>
      <article className="shop-spotlight-card shop-spotlight-card--side">
        <SpotlightInner p={secondary} rank="side" />
      </article>
    </div>
  );
}

function HorizontalProductRail({
  eyebrow,
  title,
  subtitle,
  items,
  ariaLabel,
  shuffleOffset,
  catalogSeed,
  onQuickView,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: CatalogProduct[];
  ariaLabel: string;
  shuffleOffset: number;
  catalogSeed: number;
  onQuickView?: (product: CatalogProduct) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const ordered = useMemo(
    () => shuffleWithSeed(items, catalogSeed + shuffleOffset),
    [items, catalogSeed, shuffleOffset]
  );

  const scrollCarousel = useCallback((dir: -1 | 1) => {
    const el = viewportRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientWidth * 0.78));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

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
        rootMargin: "80px 0px 120px 0px",
        root: null,
      }
    );

    track.querySelectorAll(".product-card.reveal").forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [ordered]);

  if (ordered.length === 0) return null;

  return (
    <section className="shop-rail reveal">
      <header className="shop-rail-header">
        <div>
          {eyebrow ? (
            <p className="shop-row-eyebrow">{eyebrow}</p>
          ) : null}
          <h3 className="shop-row-title">{title}</h3>
          {subtitle ? <p className="shop-row-sub">{subtitle}</p> : null}
        </div>
        <div className="shop-rail-nav">
          <button
            type="button"
            className="shop-rail-arrow"
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollCarousel(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="shop-rail-arrow"
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollCarousel(1)}
          >
            ›
          </button>
        </div>
      </header>

      <div className="products-carousel-wrap shop-rail-carousel shop-rail-carousel--compact">
        <div
          ref={viewportRef}
          className="products-carousel-viewport shop-rail-viewport"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
        >
          <div ref={trackRef} className="products-carousel-track">
            {ordered.map((p, i) => (
              <div key={p.id} className="products-carousel-slide">
                <ProductCard
                  p={p}
                  index={i}
                  onQuickView={
                    onQuickView ? () => onQuickView(p) : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsSection({
  variant = "store",
}: {
  variant?: ProductsSectionVariant;
}) {
  const { data } = useGalana();
  const embedded = data.products ?? EMPTY_CATALOG;

  const catalogSeed = useMemo(
    () => catalogShuffleSeed(embedded.map((p) => p.id)),
    [embedded]
  );

  const spotlightPair = useMemo((): [CatalogProduct, CatalogProduct] | null => {
    if (embedded.length < 2) return null;
    const pool = shuffleWithSeed(embedded, catalogSeed + 701);
    return [pool[0], pool[1]];
  }, [embedded, catalogSeed]);

  const newArrivalsList = useMemo(() => {
    const flagged = embedded.filter((p) => p.badge === "new");
    if (flagged.length) return flagged;
    return embedded.filter((p) => p.badge === "featured").slice(0, 16);
  }, [embedded]);

  const trendingPool = useMemo(() => embedded, [embedded]);

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of embedded) {
      m.set(p.cat, (m.get(p.cat) ?? 0) + 1);
    }
    return m;
  }, [embedded]);

  const [cat, setCat] = useState("all");
  const [items, setItems] = useState<CatalogProduct[]>(() =>
    filterCatalog(embedded, "all")
  );
  const [syncing, setSyncing] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<CatalogProduct | null>(null);

  const browseViewportRef = useRef<HTMLDivElement>(null);
  const browseTrackRef = useRef<HTMLDivElement>(null);

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

  const browseOrdered = useMemo(
    () => shuffleWithSeed(items, catalogSeed + 919 + cat.charCodeAt(0)),
    [items, catalogSeed, cat]
  );

  useEffect(() => {
    browseViewportRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [cat, browseOrdered]);

  useEffect(() => {
    const track = browseTrackRef.current;
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
  }, [browseOrdered]);

  const scrollBrowseCarousel = useCallback((dir: -1 | 1) => {
    const el = browseViewportRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientWidth * 0.82));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const empty = browseOrdered.length === 0;

  const carouselLabel = useMemo(() => {
    const label = FILTERS.find(([id]) => id === cat)?.[1] ?? "Products";
    return `${label} carousel`;
  }, [cat]);

  const scrollToBrowse = useCallback(() => {
    document.getElementById("browse-catalog")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const selectCategory = useCallback(
    (next: string) => {
      setCat(next);
      scrollToBrowse();
    },
    [scrollToBrowse]
  );

  const openQuickView = useCallback((p: CatalogProduct) => {
    setQuickViewProduct(p);
  }, []);

  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const totalListed = embedded.length;

  return (
    <section id="products" className="shop-storefront">
      <ProductQuickViewDialog
        product={quickViewProduct}
        onClose={closeQuickView}
      />
      <div className="section-inner shop-storefront-inner">
        <header className="shop-store-header reveal">
          <p className="shop-store-kicker">Galana Supply</p>
          <h2 className="shop-store-title">
            Shop <em>concrete essentials</em>
          </h2>
          <p className="shop-store-lede">
            {variant === "home"
              ? "Contractor-grade inventory with ecommerce clarity — curated arrivals, categories, and the full catalogue in one scroll-friendly storefront."
              : "Browse every line by category. Pricing shown where listed; everything else ships with a tailored quote."}{" "}
            <span className="shop-store-count">{totalListed}+ SKUs</span>
          </p>
        </header>

        {variant === "home" && spotlightPair ? (
          <>
            <header className="shop-row-heading reveal">
              <p className="shop-row-eyebrow">Featured highlights</p>
              <h3 className="shop-row-title">Hand-picked for your next pour</h3>
              <p className="shop-row-sub">
                Two standout picks refreshed daily — same heavy-duty quality,
                clearer paths to checkout.
              </p>
            </header>
            <ShopSpotlightPair
              primary={spotlightPair[0]}
              secondary={spotlightPair[1]}
            />
          </>
        ) : null}

        <section className="shop-by-category reveal" aria-labelledby="shop-by-cat-heading">
          <header className="shop-row-heading">
            <p className="shop-row-eyebrow">Collections</p>
            <h3 id="shop-by-cat-heading" className="shop-row-title">
              Shop by category
            </h3>
            <p className="shop-row-sub">
              Jump straight into drainage, paving, rooflines, vents, sinks, and
              structural precast.
            </p>
          </header>
          <div className="shop-category-grid">
            {SHOP_CATEGORY_TILES.map((tile) => {
              const count = categoryCounts.get(tile.cat) ?? 0;
              return (
                <button
                  key={tile.cat}
                  type="button"
                  className="shop-category-tile"
                  onClick={() => selectCategory(tile.cat)}
                >
                  <span className="shop-category-tile-title">{tile.title}</span>
                  <span className="shop-category-tile-blurb">{tile.blurb}</span>
                  <span className="shop-category-tile-meta">
                    {count} product{count === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <HorizontalProductRail
          eyebrow="Just landed"
          title="New arrivals"
          subtitle="Fresh catalogue additions — swipe to explore."
          items={newArrivalsList}
          ariaLabel="New arrivals product carousel"
          shuffleOffset={211}
          catalogSeed={catalogSeed}
          onQuickView={openQuickView}
        />

        <HorizontalProductRail
          eyebrow="Community favourites"
          title="Popular picks"
          subtitle="Rotated mix across categories."
          items={trendingPool.slice(0, Math.min(trendingPool.length, 24))}
          ariaLabel="Popular picks carousel"
          shuffleOffset={433}
          catalogSeed={catalogSeed}
          onQuickView={openQuickView}
        />

        <section
          id="browse-catalog"
          className="shop-browse-all reveal"
          aria-labelledby="browse-catalog-heading"
        >
          <header className="shop-row-heading">
            <p className="shop-row-eyebrow">Full catalogue</p>
            <h3 id="browse-catalog-heading" className="shop-row-title">
              Browse everything
            </h3>
            <p className="shop-row-sub">
              Filter by department, then glide horizontally — optimised for thumb
              and trackpad scrolling on site visits.
            </p>
          </header>

          <div
            className="products-filter shop-filter-bar"
            id="productsFilter"
            role="tablist"
            aria-label="Product departments"
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
              Updating catalogue…
            </p>
          ) : null}

          <div className="products-carousel-wrap shop-browse-carousel">
            <button
              type="button"
              className="products-carousel-arrow products-carousel-arrow-prev"
              aria-label="Scroll products left"
              onClick={() => scrollBrowseCarousel(-1)}
            >
              ‹
            </button>
            <div
              ref={browseViewportRef}
              className="products-carousel-viewport"
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label={carouselLabel}
            >
              <div ref={browseTrackRef} className="products-carousel-track">
                {empty ? (
                  <p className="products-carousel-empty">
                    No products in this category yet.
                  </p>
                ) : (
                  browseOrdered.map((p, i) => (
                    <div key={p.id} className="products-carousel-slide">
                      <ProductCard
                        p={p}
                        index={i}
                        onQuickView={() => openQuickView(p)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              type="button"
              className="products-carousel-arrow products-carousel-arrow-next"
              aria-label="Scroll products right"
              onClick={() => scrollBrowseCarousel(1)}
            >
              ›
            </button>
          </div>

          <div className="shop-store-footer-cta reveal">
            <Link href="/#contact" className="btn-outline shop-outline-btn">
              Need specs or bulk pricing? Talk to sales →
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
