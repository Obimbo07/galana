/** Skeleton placeholders for the shop / products section while the catalogue loads. */

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <article
      className={`product-card product-card--skeleton ecommerce-card${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <div className="skeleton-block product-skeleton-img" />
      <div className="product-skeleton-body">
        <div className="skeleton-block product-skeleton-line product-skeleton-line--sm" />
        <div className="skeleton-block product-skeleton-line product-skeleton-line--md" />
        <div className="skeleton-block product-skeleton-line product-skeleton-line--lg" />
        <div className="skeleton-block product-skeleton-btn" />
      </div>
    </article>
  );
}

export function ProductCarouselSkeleton({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`products-carousel-wrap shop-browse-carousel shop-catalog-grid product-carousel--skeleton${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <div className="products-carousel-viewport">
        <div className="products-carousel-track">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="products-carousel-slide">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SpotlightSkeleton() {
  return (
    <div className="shop-store-section shop-spotlight-block" aria-hidden="true">
      <header className="shop-row-heading">
        <div className="skeleton-block shop-skeleton-eyebrow" />
        <div className="skeleton-block shop-skeleton-title" />
        <div className="skeleton-block shop-skeleton-sub" />
      </header>
      <div className="shop-spotlight-grid">
        <article className="shop-spotlight-card shop-spotlight-card--hero">
          <div className="shop-spotlight-inner shop-spotlight-inner--hero">
            <div className="skeleton-block shop-skeleton-spotlight-media" />
            <div className="shop-skeleton-spotlight-copy">
              <div className="skeleton-block shop-skeleton-line shop-skeleton-line--xs" />
              <div className="skeleton-block shop-skeleton-line shop-skeleton-line--md" />
              <div className="skeleton-block shop-skeleton-line shop-skeleton-line--lg" />
              <div className="skeleton-block shop-skeleton-btn" />
            </div>
          </div>
        </article>
        <article className="shop-spotlight-card shop-spotlight-card--side">
          <div className="shop-spotlight-inner shop-spotlight-inner--side">
            <div className="skeleton-block shop-skeleton-spotlight-media shop-skeleton-spotlight-media--side" />
            <div className="shop-skeleton-spotlight-copy">
              <div className="skeleton-block shop-skeleton-line shop-skeleton-line--xs" />
              <div className="skeleton-block shop-skeleton-line shop-skeleton-line--md" />
              <div className="skeleton-block shop-skeleton-btn shop-skeleton-btn--sm" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export function PopularPicksSkeleton() {
  return (
    <section
      className="shop-store-section shop-popular"
      aria-labelledby="shop-popular-skeleton-heading"
      aria-busy="true"
    >
      <header className="shop-row-heading">
        <div className="skeleton-block shop-skeleton-eyebrow" />
        <h3 id="shop-popular-skeleton-heading" className="sr-only">
          Loading popular picks
        </h3>
        <div className="skeleton-block shop-skeleton-title" />
        <div className="skeleton-block shop-skeleton-sub" />
      </header>
      <div className="shop-popular-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="shop-popular-grid-cell">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CatalogLoadingStatus({
  label = "Loading products…",
}: {
  label?: string;
}) {
  return (
    <p className="catalog-loading-status" role="status" aria-live="polite">
      <span className="catalog-loading-spinner" aria-hidden="true" />
      {label}
    </p>
  );
}

/** Suspense fallback for the homepage products block. */
export function ProductsSectionHomeSkeleton() {
  return (
    <section id="products" className="shop-storefront shop-storefront--loading" aria-busy="true">
      <div className="section-inner shop-storefront-inner">
        <header className="shop-store-header">
          <div className="skeleton-block shop-skeleton-kicker" />
          <div className="skeleton-block shop-skeleton-hero-title" />
          <div className="skeleton-block shop-skeleton-lede" />
        </header>
        <SpotlightSkeleton />
        <section className="shop-store-section shop-by-category" aria-hidden="true">
          <header className="shop-row-heading">
            <div className="skeleton-block shop-skeleton-eyebrow" />
            <div className="skeleton-block shop-skeleton-title" />
          </header>
          <div className="shop-category-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton-block shop-skeleton-category-tile" />
            ))}
          </div>
        </section>
        <PopularPicksSkeleton />
        <section className="shop-store-section shop-browse-all" aria-hidden="true">
          <header className="shop-row-heading">
            <div className="skeleton-block shop-skeleton-eyebrow" />
            <div className="skeleton-block shop-skeleton-title" />
          </header>
          <ProductCarouselSkeleton count={6} />
        </section>
      </div>
    </section>
  );
}
