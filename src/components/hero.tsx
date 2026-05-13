"use client";

import Image from "next/image";
import Link from "next/link";
import { useGalana } from "@/providers/galana-provider";
import type { CalcTab } from "@/lib/calculator-math";

export function Hero() {
  const {
    data,
    calc,
    setCalc,
    heroTab,
    setHeroTab,
    pavingResult,
    pipeResult,
    roofResult,
  } = useGalana();

  const h = data.hero;

  function switchHero(type: CalcTab) {
    setHeroTab(type);
  }

  return (
    <section id="hero">
      <div className="hero-photo">
        <Image
          src="/wallpaper/combined.jpeg"
          alt="Galana concrete pipes, paving, roof tiles and precast products"
          fill
          priority
          sizes="100vw"
          className="hero-photo-img"
        />
      </div>
      <div className="hero-bg" aria-hidden />
      <div className="hero-grid" aria-hidden />
      <div className="hero-shell">
        <div className="hero-main">
          <div className="hero-copy">
            <div className="hero-eyebrow">{h.eyebrow}</div>
            <h1 className="hero-title">
              {h.titleLines.map((line, i) => (
                <span key={i}>
                  {i === h.titleItalicIndex ? (
                    <em className="hero-title-accent">{line}</em>
                  ) : (
                    line
                  )}
                  {i < h.titleLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h1>
            <p className="hero-sub">{h.sub}</p>
            <div className="hero-actions">
              <Link href={h.primaryCta.href} className="btn-primary">
                <span>{h.primaryCta.label}</span>
                <span>→</span>
              </Link>
              <Link href={h.secondaryCta.href} className="btn-outline">
                <span>{h.secondaryCta.label}</span>
              </Link>
            </div>
          </div>

          <div className="hero-calc" aria-label="Quick materials estimate">
            <div className="hero-calc-head">Quick estimate</div>
            <div className="calc-tab-row">
              <button
                type="button"
                className={`calc-tab${heroTab === "paving" ? " active" : ""}`}
                onClick={() => switchHero("paving")}
              >
                Paving Blocks
              </button>
              <button
                type="button"
                className={`calc-tab${heroTab === "pipes" ? " active" : ""}`}
                onClick={() => switchHero("pipes")}
              >
                Drainage Pipes
              </button>
              <button
                type="button"
                className={`calc-tab${heroTab === "roofing" ? " active" : ""}`}
                onClick={() => switchHero("roofing")}
              >
                Roof Tiles
              </button>
            </div>

            <div
              className={`calc-form${heroTab === "paving" ? " active" : ""}`}
              id="hero-calc-paving"
            >
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pav-length">
                  Length (m)
                </label>
                <input
                  id="hero-pav-length"
                  type="number"
                  className="calc-input"
                  placeholder="e.g. 15"
                  min={0}
                  value={calc.pavingLength}
                  onChange={(e) =>
                    setCalc({ pavingLength: e.target.value })
                  }
                />
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pav-width">
                  Width (m)
                </label>
                <input
                  id="hero-pav-width"
                  type="number"
                  className="calc-input"
                  placeholder="e.g. 10"
                  min={0}
                  value={calc.pavingWidth}
                  onChange={(e) =>
                    setCalc({ pavingWidth: e.target.value })
                  }
                />
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pav-type">
                  Block type
                </label>
                <select
                  id="hero-pav-type"
                  className="calc-select"
                  value={calc.pavingBlocksPerM2}
                  onChange={(e) =>
                    setCalc({
                      pavingBlocksPerM2: parseFloat(e.target.value),
                    })
                  }
                >
                  {data.calculator.paving.blocksPerM2Options.map((o) => (
                    <option key={o.id} value={o.blocksPerM2}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pav-waste">
                  Wastage (%)
                </label>
                <input
                  id="hero-pav-waste"
                  type="number"
                  className="calc-input"
                  placeholder="10"
                  min={0}
                  max={30}
                  value={calc.pavingWaste}
                  onChange={(e) =>
                    setCalc({ pavingWaste: e.target.value })
                  }
                />
              </div>
              <div
                className={`calc-result${pavingResult ? " show" : ""}`}
                id="hero-pav-result"
              >
                <div className="calc-result-label">Estimated blocks</div>
                <div className="calc-result-value" id="hero-pav-value">
                  {pavingResult?.value ?? "—"}
                </div>
                <div className="calc-result-note" id="hero-pav-note">
                  {pavingResult?.note ?? ""}
                </div>
              </div>
            </div>

            <div
              className={`calc-form${heroTab === "pipes" ? " active" : ""}`}
              id="hero-calc-pipes"
            >
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pipe-length">
                  Run length (m)
                </label>
                <input
                  id="hero-pipe-length"
                  type="number"
                  className="calc-input"
                  placeholder="e.g. 120"
                  min={0}
                  value={calc.pipeLength}
                  onChange={(e) =>
                    setCalc({ pipeLength: e.target.value })
                  }
                />
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pipe-type">
                  Pipe type
                </label>
                <select
                  id="hero-pipe-type"
                  className="calc-select"
                  value={calc.pipeSectionM}
                  onChange={(e) =>
                    setCalc({
                      pipeSectionM: parseFloat(e.target.value),
                    })
                  }
                >
                  {data.calculator.pipes.pipeTypes.map((o) => (
                    <option key={o.id} value={o.sectionM}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-pipe-extra">
                  Extra for joints (%)
                </label>
                <input
                  id="hero-pipe-extra"
                  type="number"
                  className="calc-input"
                  placeholder="5"
                  min={0}
                  max={20}
                  value={calc.pipeExtra}
                  onChange={(e) =>
                    setCalc({ pipeExtra: e.target.value })
                  }
                />
              </div>
              <div
                className={`calc-result${pipeResult ? " show" : ""}`}
                id="hero-pipe-result"
              >
                <div className="calc-result-label">Pipe sections</div>
                <div className="calc-result-value" id="hero-pipe-value">
                  {pipeResult?.value ?? "—"}
                </div>
                <div className="calc-result-note" id="hero-pipe-note">
                  {pipeResult?.note ?? ""}
                </div>
              </div>
            </div>

            <div
              className={`calc-form${heroTab === "roofing" ? " active" : ""}`}
              id="hero-calc-roofing"
            >
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-roof-area">
                  Roof area (m²)
                </label>
                <input
                  id="hero-roof-area"
                  type="number"
                  className="calc-input"
                  placeholder="e.g. 80"
                  min={0}
                  value={calc.roofArea}
                  onChange={(e) =>
                    setCalc({ roofArea: e.target.value })
                  }
                />
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-roof-type">
                  Tile type
                </label>
                <select
                  id="hero-roof-type"
                  className="calc-select"
                  value={calc.roofTilesPerM2}
                  onChange={(e) =>
                    setCalc({
                      roofTilesPerM2: parseFloat(e.target.value),
                    })
                  }
                >
                  {data.calculator.roofing.tileTypes.map((o) => (
                    <option key={o.id} value={o.tilesPerM2}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="hero-roof-waste">
                  Wastage (%)
                </label>
                <input
                  id="hero-roof-waste"
                  type="number"
                  className="calc-input"
                  placeholder="10"
                  min={0}
                  max={25}
                  value={calc.roofWaste}
                  onChange={(e) =>
                    setCalc({ roofWaste: e.target.value })
                  }
                />
              </div>
              <div
                className={`calc-result${roofResult ? " show" : ""}`}
                id="hero-roof-result"
              >
                <div className="calc-result-label">Estimated tiles</div>
                <div className="calc-result-value" id="hero-roof-value">
                  {roofResult?.value ?? "—"}
                </div>
                <div className="calc-result-note" id="hero-roof-note">
                  {roofResult?.note ?? ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line" />
          <span>Scroll to explore</span>
        </div>

        <div className="hero-bottom">
          <div className="hero-stats">
            {h.stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div id="diff-band">
            <div className="diff-scroll" id="diffScroll">
              {[...h.diffBand, ...h.diffBand].map((text, i) => (
                <span className="diff-item" key={i}>
                  <span className="diff-dot" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
