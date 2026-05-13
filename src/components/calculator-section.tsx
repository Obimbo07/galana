"use client";

import Link from "next/link";
import { useGalana } from "@/providers/galana-provider";
import type { CalcTab } from "@/lib/calculator-math";

export function CalculatorSection() {
  const {
    data,
    calc,
    setCalc,
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
    openMailtoQuote,
    postQuoteApi,
  } = useGalana();

  function switchCalc(type: CalcTab) {
    setMainTab(type);
  }

  return (
    <section id="calculator">
      <div className="section-inner">
      <div className="section-tag reveal">Smart Tools</div>
      <h2 className="section-title reveal reveal-delay-1">
        Materials <em>Calculator</em>
      </h2>
      <p className="section-sub reveal reveal-delay-2">
        Estimate exactly what you need before you order. No more guesswork,
        no over-ordering, no delays waiting for more stock.
      </p>
      <div className="calc-wrapper">
        <div className="calc-box reveal reveal-delay-3">
          <div className="calc-tab-row">
            <button
              type="button"
              className={`calc-tab${mainTab === "paving" ? " active" : ""}`}
              onClick={() => switchCalc("paving")}
            >
              Paving Blocks
            </button>
            <button
              type="button"
              className={`calc-tab${mainTab === "pipes" ? " active" : ""}`}
              onClick={() => switchCalc("pipes")}
            >
              Drainage Pipes
            </button>
            <button
              type="button"
              className={`calc-tab${mainTab === "roofing" ? " active" : ""}`}
              onClick={() => switchCalc("roofing")}
            >
              Roof Tiles
            </button>
          </div>

          <div
            className={`calc-form${mainTab === "paving" ? " active" : ""}`}
            id="calc-paving"
          >
            <div className="calc-field">
              <label className="calc-label" htmlFor="pav-length">
                Area Length (metres)
              </label>
              <input
                id="pav-length"
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
              <label className="calc-label" htmlFor="pav-width">
                Area Width (metres)
              </label>
              <input
                id="pav-width"
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
              <label className="calc-label" htmlFor="pav-type">
                Block Type
              </label>
              <select
                id="pav-type"
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
              <label className="calc-label" htmlFor="pav-waste">
                Wastage Buffer (%)
              </label>
              <input
                id="pav-waste"
                type="number"
                className="calc-input"
                placeholder="e.g. 10"
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
              id="pav-result"
            >
              <div className="calc-result-label">
                Estimated Blocks Required
              </div>
              <div className="calc-result-value" id="pav-value">
                {pavingResult?.value ?? "—"}
              </div>
              <div className="calc-result-note" id="pav-note">
                {pavingResult?.note ?? ""}
              </div>
            </div>
          </div>

          <div
            className={`calc-form${mainTab === "pipes" ? " active" : ""}`}
            id="calc-pipes"
          >
            <div className="calc-field">
              <label className="calc-label" htmlFor="pipe-length">
                Total Run Length (metres)
              </label>
              <input
                id="pipe-length"
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
              <label className="calc-label" htmlFor="pipe-type">
                Pipe Type
              </label>
              <select
                id="pipe-type"
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
              <label className="calc-label" htmlFor="pipe-extra">
                Extra Joints/Connections (%)
              </label>
              <input
                id="pipe-extra"
                type="number"
                className="calc-input"
                placeholder="e.g. 5"
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
              id="pipe-result"
            >
              <div className="calc-result-label">
                Pipe Sections Required
              </div>
              <div className="calc-result-value" id="pipe-value">
                {pipeResult?.value ?? "—"}
              </div>
              <div className="calc-result-note" id="pipe-note">
                {pipeResult?.note ?? ""}
              </div>
            </div>
          </div>

          <div
            className={`calc-form${mainTab === "roofing" ? " active" : ""}`}
            id="calc-roofing"
          >
            <div className="calc-field">
              <label className="calc-label" htmlFor="roof-area">
                Roof Area (m²)
              </label>
              <input
                id="roof-area"
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
              <label className="calc-label" htmlFor="roof-type">
                Tile Type
              </label>
              <select
                id="roof-type"
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
              <label className="calc-label" htmlFor="roof-waste">
                Wastage & Cut Buffer (%)
              </label>
              <input
                id="roof-waste"
                type="number"
                className="calc-input"
                placeholder="e.g. 10"
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
              id="roof-result"
            >
              <div className="calc-result-label">
                Estimated Tiles Required
              </div>
              <div className="calc-result-value" id="roof-value">
                {roofResult?.value ?? "—"}
              </div>
              <div className="calc-result-note" id="roof-note">
                {roofResult?.note ?? ""}
              </div>
            </div>
          </div>

          <div
            className={`quote-send-panel${quotePanelOpen ? " open" : ""}`}
            id="quoteSendPanel"
          >
            <button
              type="button"
              className="quote-send-toggle"
              aria-expanded={quotePanelOpen}
              onClick={() => setQuotePanelOpen(!quotePanelOpen)}
            >
              <span>Send quote / Request quote</span>
              <span className="chev">▸</span>
            </button>
            <div
              className="quote-send-body"
              id="quoteSendBody"
              hidden={!quotePanelOpen}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  marginTop: "0.75rem",
                  lineHeight: 1.55,
                }}
              >
                Summary uses the <strong>active calculator tab</strong>, your{" "}
                <strong>hero quick estimate</strong>, and your{" "}
                <strong>cart</strong>. Email opens via{" "}
                <code style={{ color: "var(--blue-light)" }}>mailto:</code>.
              </p>
              <div className="form-field">
                <label className="calc-label" htmlFor="quoteEmailInput">
                  Your email
                </label>
                <input
                  id="quoteEmailInput"
                  type="email"
                  className="calc-input"
                  placeholder="you@company.com"
                  list="quoteEmailSuggestions"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                />
                <datalist id="quoteEmailSuggestions">
                  {recentEmails.map((e) => (
                    <option key={e} value={e} />
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "0.5rem",
                }}
                onClick={openMailtoQuote}
              >
                Open email draft (mailto)
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "0.65rem",
                }}
                onClick={() => void postQuoteApi()}
              >
                Submit via API (optional)
              </button>
              <p className="quote-api-hint" id="quoteApiHint">
                Configure <code>QUOTE_API_URL</code> in{" "}
                <code>.env.local</code> (see <code>.env.example</code>) so{" "}
                <code>/api/quote</code> can forward JSON to your backend.
              </p>
              <div className="form-field">
                <label className="calc-label" htmlFor="quoteBodyTextarea">
                  Quote body (copy manually if needed)
                </label>
                <textarea
                  id="quoteBodyTextarea"
                  className="form-textarea"
                  style={{ minHeight: 140, fontSize: "0.78rem" }}
                  readOnly
                  value={quoteBody}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="calc-info reveal reveal-delay-4">
          <h3>Why estimate before you order?</h3>
          <div className="calc-feature">
            <div className="calc-feat-dot" />
            <div className="calc-feat-text">
              <strong>Avoid costly over-ordering.</strong> Concrete products are
              heavy to return and store. Order exactly what you need.
            </div>
          </div>
          <div className="calc-feature">
            <div className="calc-feat-dot" />
            <div className="calc-feat-text">
              <strong>No project delays.</strong> Know your quantities upfront —
              procurement and delivery can be planned from day one.
            </div>
          </div>
          <div className="calc-feature">
            <div className="calc-feat-dot" />
            <div className="calc-feat-text">
              <strong>Accurate budgeting.</strong> Bring reliable estimates to
              your quantity surveyor or client — no more guesswork.
            </div>
          </div>
          <div className="calc-feature">
            <div className="calc-feat-dot" />
            <div className="calc-feat-text">
              <strong>Wastage buffer included.</strong> Our calculator accounts
              for cuts, breakages, and patterns so you&apos;re always covered.
            </div>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/#contact" className="btn-primary">
              Request Formal Quote →
            </Link>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
