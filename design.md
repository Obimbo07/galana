# Galana — design reference (implemented)

![Theme](https://img.shields.io/badge/theme-light%20%7C%20dark-f8fafc?style=for-the-badge&labelColor=148eb2&color=000000)

**Last updated:** 2026-05-13 · **Stack:** Next.js **16.2** (App Router), React 19 · **CSS:** global tokens in `src/app/globals.css` (no Tailwind) · **Motion:** CSS keyframes and transitions only (no Framer Motion dependency)

---

## Quick reference

| Item | Value |
|------|--------|
| Primary accent | Blue `--blue` / `--blue-light` (nav chrome, links, FAB AI, focus rings) |
| Secondary accent | Warm gold gradients (`--gold-*`, `--gradient-gold*`) — premium emphasis, not flat yellow UI |
| Body font | Outfit (`--font-outfit`), weight 300, line-height 1.65 |
| Display font | Cormorant Garamond (`--font-cormorant`) |
| Theme | **System:** `prefers-color-scheme: light` swaps neutrals when `<html>` has no `data-theme`. **`data-theme="light"`** / **`data-theme="dark"`** on **`<html>`** force palette. Persist: `localStorage['galana_theme']` = `light` \| `dark` \| `system` via `ThemeInit` |
| Social (nav/footer) | `NavSocialLinks` uses `.nav-social-link--*` for **brand-fill** discs (glyph `currentColor`, usually white-on-brand; X inverts light/dark UI) |

---

## Brand and intent

- **Positioning:** Industrial-premium — default **dark**: near-black base, crisp light copy, blue chrome, gold as jewellery. **Light / system light:** white and cool off-white surfaces, navy ink, blue borders, readable gray-blue muted text.
- **Gold:** Keep gold tokens for borders, hero accent text, CTA blends; do not replace the whole site with yellow.

---

## Typography

| Role | Where | Notes |
|------|--------|--------|
| Body | `body` | `var(--font-outfit)`, 300, `color: var(--text)` |
| Hero H1 | `.hero-title` | Cormorant 300, `clamp(3.5rem, 7vw, 6.5rem)`; `em.hero-title-accent` = gold gradient text clip |
| Section H2 | `.section-title` | Cormorant 300, `clamp(2.2rem, 4vw, 3.5rem)` |
| Micro labels | `.hero-eyebrow`, `.section-tag`, `.calc-label`, etc. | Outfit, uppercase, letter-spacing ~0.12–0.3em |
| Stat / big numbers | `.stat-num`, `.calc-result-value`, `.modal-title` | Cormorant |

Fonts are loaded in `src/app/layout.tsx` with `next/font` (Outfit + Cormorant Garamond).

---

## Color tokens

### Blue (primary)

| Token | Hex |
|-------|-----|
| `--blue` | `#148eb2` |
| `--blue-dark` | `#0e6f8a` |
| `--blue-deeper` | `#085566` |
| `--blue-light` | `#4ab9d9` |
| `--blue-pale` | `#e8f4f8` |

### Neutrals (`:root` + `html[data-theme="dark"]` → forced / system-dark | light override)

| Token | Dark | Light (`prefers-light` sans `data-theme`, or `data-theme="light"`) |
|-------|------|-------------------------------------|
| `--black` | `#000000` | `#f8fafc` |
| `--black-soft` | `#0a0a0a` | `#f1f5f9` |
| `--dark` | `#0c0c0c` | `#e8eef4` |
| `--mid` | `#141414` | `#d7dee8` |
| `--border` | `#2a333d` | `#b8c5d4` |
| `--text` | `#f5f5f5` | `#0f1b24` |
| `--muted` | `#9eb0bd` | `#5c6f80` |
| `--white` | `#f7f9fa` | `#0a1620` |

`--white` is **semantic “display ink”**: light text on dark UI; on light UI it is **dark heading/contrast ink** on pale surfaces — not literal white paint.

### Gold (warm accent; hue shifts slightly with gradients; tokens shared across themes)

| Token | Role |
|-------|------|
| `--gold-deep` … `--gold-glow` | Solid stops, glow |
| `--gradient-gold` | Diagonal premium fill |
| `--gradient-gold-soft` | Wash |
| `--gradient-gold-cta` | CTA / nav CTA blend |

### Theme-aware chrome variables

| Token | Use |
|-------|-----|
| `--nav-bg`, `--nav-bg-scrolled` | Fixed nav backgrounds |
| `--nav-border`, `--nav-border-scrolled` | Nav bottom border |
| `--nav-mobile-menu-bg` | Mobile flyout menu |
| `--btn-outline-surface` | `.btn-outline` padding fill |
| `--hero-calc-bg`, `--quote-send-bg` | Hero calc / quote panel surfaces |
| `--media-bottom-scrim` | Bottom fade on product imagery (does not flip with theme; keeps white overlay text readable) |
| `--scrim-modal-bg`, `--scrim-drawer` | Modal overlay and cart drawer backdrop |

---

## Layout

| Topic | Rule of thumb |
|--------|----------------|
| Section padding | `7rem 3rem`; ≤900px → `5rem 1.5rem` |
| Hero shell | `max-width: 1320px`, top padding `6.5rem`, horizontal padding accounts for logo/FAB gutter |
| Hero main grid | 1 column default; **≥1024px** → copy + calculator columns |
| Breakpoints | **900px:** nav/mobile menu, tighter padding; **1024px:** hero two-column |
| Hero layers | `.hero-photo` → `.hero-bg` → `.hero-grid` → `.hero-shell` (`z-index: 3`) |

---

## Components

| Pattern | Classes / location |
|---------|---------------------|
| Primary / outline buttons | `.btn-primary`, `.btn-outline`; nav CTA `.nav-cta` |
| Cards | `.service-card`, `.product-card`, `.job-card` |
| Nav | `nav` in `navbar.tsx` (includes theme **System / Light / Dark** control); `.scrolled`; mobile `.nav-links` / `.nav-menu-toggle` |
| Social | `NavSocialLinks` (`nav-social.tsx`) — footer + tag bar; `.nav-social-link--{linkedin,instagram,facebook,youtube,twitter}` brand fills in CSS |
| Cart | `.nav-cart-btn`, `.cart-drawer` (`cart-drawer.tsx`) |
| FAB / support | `.help-fab-wrap`, `.help-panel` (`support-widget.tsx`) |
| Modals | `.modal-overlay`, `.modal` (`apply-modal.tsx`) |
| Reveal | `.reveal` + `.visible` from `site-effects.tsx` (`IntersectionObserver`) |

---

## Imagery

| Asset | Use |
|-------|-----|
| `/wallpaper/combined.jpeg` | Hero LCP (`hero.tsx`, `next/image`, `priority`) |
| `/wallpaper/pavement-lay.png` | Why mood strip (CSS background) |
| `/wallpaper/rooftiles.jpeg` | Contact rail (`contact-footer.tsx`) |
| `/images/products/...` | Catalog; URLs in `data/data.json` / `public/data/data.json` |
| Download script | `scripts/download-product-images.mjs` |

---

## Motion

- **Reveal:** `.reveal` opacity + `translateY`; stagger via `.reveal-delay-*` / `--reveal-i`.
- **Hero:** `fadeUp`, `heroPhotoGlow` (motion-safe only).
- **Ambient:** marquee `.diff-scroll`, `.scroll-line::after`.
- **Overlays:** cart drawer, modal, help panel — opacity/transform transitions.
- **Micro:** hover lifts, `cartBadgeBounce`, custom cursor (`site-effects.tsx`).
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` in `globals.css` disables or flattens the above.

---

## Accessibility

- **Focus:** Prefer rings using `var(--blue-light)` or matching blue rgba from tokens.
- **Gold on mid-tones:** Check contrast when using gold text on non-dark fills.
- **Hero accent:** Gradient text with `@supports not (background-clip: text)` fallback to `--gold-text`.
- **Cursor:** `cursor: none` + custom cursor on fine pointers; `pointer: coarse` restores system cursor and hides custom dots.

---

## File map

| Area | Path |
|------|------|
| Tokens + UI CSS | `src/app/globals.css` |
| Theme bootstrap + shared helpers | `src/components/theme-init.tsx`, `src/lib/galana-theme.ts` |
| Fonts + root layout | `src/app/layout.tsx` |
| Page | `src/app/page.tsx` |
| Sections & widgets | `src/components/*` — e.g. `hero.tsx`, `navbar.tsx`, `nav-theme-toggle.tsx`, `services-section.tsx`, ... |
| Site / product data | `public/data/data.json`, `data/data.json` |
| Images script | `scripts/download-product-images.mjs` |

---

## Common violations

- Hard-coding surface hex on new UI instead of `--black`, `--dark`, `--border`, `--text`, `--muted`.
- Treating `--white` as literal white — in light mode it is **dark heading ink**.
- Using gold as the primary flat fill for large areas (keep blue primary; gold accent).
- Adding motion without checking `prefers-reduced-motion` for large layout shifts or infinite animations.
- Shipping new hero/section scrims as one-off rgba blobs instead of extending tokens or matching existing patterns.

---

## Quick theme test

1. **System only:** Remove `data-theme` from `<html>`. Toggle OS light/dark — neutrals and nav/cart chrome should follow.
2. **Force in DevTools:** Set `<html data-theme="light">` or `data-theme="dark">` — should override OS.
3. **Persist (optional):** In the console: `localStorage.setItem('galana_theme','light')` then reload (after `ThemeInit`, expect `data-theme="light"`). Use `'dark'` for forced dark on a light OS; `'system'` or `removeItem` clears the attribute.
