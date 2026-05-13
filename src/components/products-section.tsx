"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useGalana } from "@/providers/galana-provider";

const FILTERS: Array<[string, string]> = [
  ["all", "All Products"],
  ["pipes", "Concrete Pipes"],
  ["precast", "Precast"],
  ["paving", "Paving Blocks"],
  ["roofing", "Roof Tiles"],
];

export function ProductsSection() {
  const { data, addToCart } = useGalana();
  const [cat, setCat] = useState("all");

  const visible = useMemo(() => {
    const products = data.products ?? [];
    return cat === "all" ? products : products.filter((p) => p.cat === cat);
  }, [data.products, cat]);

  return (
    <section id="products">
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
      >
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`filter-btn${cat === id ? " active" : ""}`}
            onClick={() => setCat(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="products-grid" id="productsGrid">
        {!visible.length ? (
          <p
            style={{
              color: "var(--muted)",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            No products in catalog.
          </p>
        ) : (
          visible.map((p, i) => (
            <div
              className="product-card reveal reveal-stagger-item"
              key={p.id}
              data-cat={p.cat}
              data-product-id={p.id}
              style={{ ["--reveal-i" as string]: i }}
            >
              <div className="product-img-wrap">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 280px"
                  className="object-cover"
                />
                <div className="product-overlay">
                  <div className="product-overlay-btn">View Details →</div>
                </div>
              </div>
              <div className="product-info">
                <div className="product-cat-badge">{p.catLabel}</div>
                <div className="product-name">{p.name}</div>
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
            </div>
          ))
        )}
      </div>
      <div
        style={{ textAlign: "center", marginTop: "2.5rem" }}
        className="reveal reveal-delay-4"
      >
        <a href="#contact" className="btn-outline">
          Request Full Catalog →
        </a>
      </div>
    </section>
  );
}
