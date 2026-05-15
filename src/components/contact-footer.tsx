"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NavSocialLinks } from "@/components/nav-social";
import { useGalana } from "@/providers/galana-provider";

export function ContactFooter() {
  const { data } = useGalana();
  const contact = data.contact;
  const footer = data.footer;
  const [quoteSent, setQuoteSent] = useState(false);

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
              <div className="contact-actions reveal reveal-delay-5" style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a
                  href={`https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(data.help.whatsappPrefill)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ flex: "1", minWidth: "150px", textAlign: "center" }}
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`tel:${contact.phoneTel}`}
                  className="btn-outline"
                  style={{ flex: "1", minWidth: "150px", textAlign: "center" }}
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
                  Tell us about your project and we&apos;ll respond within 24
                  hours.
                </p>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Company / Project"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+254..."
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Product Category</label>
                  <select className="form-select" defaultValue="">
                    <option value="" disabled>
                      -- Select Category --
                    </option>
                    <option>Concrete Pipes</option>
                    <option>Paving Blocks</option>
                    <option>Precast Products</option>
                    <option>Concrete Roof Tiles</option>
                    <option>Custom Design</option>
                    <option>Multiple Categories</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Project Description & Quantities
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe your project, quantities needed, location and any special requirements..."
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setQuoteSent(true)}
                >
                  Send Request →
                </button>
              </div>
            ) : (
              <div className="form-success show" id="formSuccess">
                <div className="form-success-icon">✓</div>
                <h4>Quote Request Sent!</h4>
                <p>
                  Thank you. Our team will review your project and respond
                  within 24 hours with a detailed quote and delivery timeline.
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
              <Image
                src="/images/logo.jpg"
                alt="Galana Group"
                width={160}
                height={48}
                style={{ height: 48, width: "auto" }}
              />
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
