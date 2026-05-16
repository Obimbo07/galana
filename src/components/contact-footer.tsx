"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NavSocialLinks } from "@/components/nav-social";
import { SiteLogo } from "@/components/site-logo";
import { useGalana } from "@/providers/galana-provider";

export function ContactFooter() {
  const { data, postQuoteApi, downloadQuotePdf } = useGalana();
  const contact = data.contact;
  const footer = data.footer;
  const [quoteSent, setQuoteSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const Categories = [
    "Concrete Pipes",
    "Paving Blocks",
    "Precast Products",
    "Concrete Roof Tiles",
    "Custom Design",
    "Multiple Categories",
  ];

  async function submitContactQuote() {
    setFormErr(null);
    setBusy(true);
    try {
      const res = await postQuoteApi({
        source: "contact",
        fullName: fullName.trim() || undefined,
        company: company.trim() || undefined,
        fromEmail: email.trim(),
        fromPhone: phone.trim() || undefined,
        location: location.trim() || undefined,
        inquiryCategory: category.trim() || undefined,
        inquiryMessage: message.trim() || undefined,
      });
      if (!res.ok) {
        setFormErr(res.message);
        return;
      }
      if (res.id) {
        try {
          await downloadQuotePdf(res.id);
        } catch (e) {
          window.alert(
            e instanceof Error
              ? e.message
              : "PDF download failed. Your request was still saved."
          );
        }
      } else {
        window.alert(
          "Request accepted but not stored for PDF. Add FIREBASE_SERVICE_ACCOUNT_JSON to enable saving and downloads."
        );
      }
      setQuoteSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section id="contact">
        <div className="section-inner">
          <div className="contact-wrapper">
            <div>
              <div className="section-tag reveal">Get In Touch</div>
              <div className="contact-info">
                <h3 className="reveal reveal-delay-1">
                  Let&apos;s Build Something <em>Great</em>
                </h3>
                <div className="contact-item reveal">
                  <div className="contact-icon">📧</div>
                  <div>
                    <div className="contact-item-label">Email</div>
                    <div className="contact-item-value">
                      <a href={`mailto:${contact.infoEmail}`}>
                        {contact.infoEmail}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-item reveal reveal-delay-1">
                  <div className="contact-icon">📱</div>
                  <div>
                    <div className="contact-item-label">Phone / WhatsApp</div>
                    <div className="contact-item-value">
                      <a href={`tel:${contact.phoneTel}`}>
                        {contact.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>
                {contact.altPhoneTel ? (
                  <div className="contact-item reveal reveal-delay-2">
                    <div className="contact-icon">📞</div>
                    <div>
                      <div className="contact-item-label">Alternate phone</div>
                      <div className="contact-item-value">
                        <a href={`tel:${contact.altPhoneTel}`}>
                          {contact.altPhoneDisplay ?? contact.altPhoneTel}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="contact-item reveal reveal-delay-3">
                  <div className="contact-icon">📍</div>
                  <div>
                    <div className="contact-item-label">Location</div>
                    <div className="contact-item-value">
                      {contact.locationUrl?.trim() ? (
                        <a
                          href={contact.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.location}
                        </a>
                      ) : (
                        contact.location
                      )}
                    </div>
                  </div>
                </div>
                <div className="contact-item reveal reveal-delay-4">
                  <div className="contact-icon">⏰</div>
                  <div>
                    <div className="contact-item-label">Operating Hours</div>
                    <div className="contact-item-value">
                      {contact.operatingHours}
                    </div>
                  </div>
                </div>
                <div
                  className="contact-actions reveal reveal-delay-5"
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={`https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(data.help.whatsappPrefill)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      flex: "1",
                      minWidth: "150px",
                      textAlign: "center",
                    }}
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${contact.phoneTel}`}
                    className="btn-outline"
                    style={{
                      flex: "1",
                      minWidth: "150px",
                      textAlign: "center",
                    }}
                  >
                    📞 Call Now
                  </a>
                </div>
              </div>
            </div>
            <div className="quote-box quote-box-visual reveal reveal-delay-3">
              <div className="contact-photo-rail" aria-hidden>
                <Image
                  src="/wallpaper/rooftiles.jpeg"
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 220px"
                  className="contact-photo-rail-img"
                />
                <div className="contact-photo-rail-scrim" />
              </div>
              {!quoteSent ? (
                <div id="quoteForm">
                  <h3>Request a Quote</h3>
                  <p>
                    Tell us about your project — all fields optional. We save
                    your request and email you a branded PDF summary when our
                    backend is configured.
                  </p>
                  {formErr ? (
                    <p
                      style={{
                        color: "#c45c4a",
                        fontSize: "0.8rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {formErr}
                    </p>
                  ) : null}
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">
                        Full name{" "}
                        <span style={{ opacity: 0.65 }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Your name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        Company{" "}
                        <span style={{ opacity: 0.65 }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Company / Project"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">
                        Phone / WhatsApp{" "}
                        <span style={{ opacity: 0.65 }}>(optional)</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+254…"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        Email{" "}
                        <span style={{ opacity: 0.65 }}>(optional)</span>
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Project / site location{" "}
                      <span style={{ opacity: 0.65 }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="City, county, site…"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Product category{" "}
                      <span style={{ opacity: 0.65 }}>(optional)</span>
                    </label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">— Select if helpful —</option>
                      {Categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      Project description &amp; quantities{" "}
                      <span style={{ opacity: 0.65 }}>(optional)</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="Describe your project, quantities needed, and any special requirements…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                    }}
                    disabled={busy}
                    onClick={() => void submitContactQuote()}
                  >
                    {busy ? "Sending…" : "Submit & download PDF →"}
                  </button>
                </div>
              ) : (
                <div className="form-success show" id="formSuccess">
                  <div className="form-success-icon">✓</div>
                  <h4>Quote request received</h4>
                  <p>
                    Thank you. If downloads are enabled, your PDF should have
                    started. Our team will follow up within 24 hours.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="section-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand">
                <SiteLogo heightPx={48} />
              </div>
              <p className="footer-tagline">&quot;{footer.tagline}&quot;</p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "0.75rem",
                  maxWidth: 240,
                  lineHeight: 1.7,
                }}
              >
                {footer.about}
              </p>
            </div>
            <div className="footer-links">
              <h4>Services</h4>
              <ul>
                <li>
                  <Link href="/services">Precast Products</Link>
                </li>
                <li>
                  <Link href="/services">Custom Design</Link>
                </li>
                <li>
                  <Link href="/services">Site Assessment</Link>
                </li>
                <li>
                  <Link href="/services">Delivery & Logistics</Link>
                </li>
                <li>
                  <Link href="/services">Contractor Accounts</Link>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Products</h4>
              <ul>
                <li>
                  <Link href="/products">Concrete Pipes</Link>
                </li>
                <li>
                  <Link href="/products">Paving Blocks</Link>
                </li>
                <li>
                  <Link href="/products">Precast Elements</Link>
                </li>
                <li>
                  <Link href="/products">Roof Tiles</Link>
                </li>
                <li>
                  <Link href="/calculator">Materials Calculator</Link>
                </li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <ul>
                <li>
                  <Link href="/why-us">About Galana</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
                <li>
                  <Link href="/">Contact Us</Link>
                </li>
                <li>
                  <Link href="/">Get a Quote</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">{footer.copyright}</div>
            <div className="social-row footer-social-wrap">
              <NavSocialLinks social={data.social} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
