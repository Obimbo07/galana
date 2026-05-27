import Link from "next/link";

export type CtaStripAction = {
  href: string;
  label: string;
  variant?: "primary" | "outline";
};

export type CtaStripProps = {
  eyebrow?: string;
  title?: string;
  sub?: string;
  actions?: CtaStripAction[];
};

const DEFAULT_ACTIONS: CtaStripAction[] = [
  { href: "/calculator", label: "Calculate materials", variant: "primary" },
  { href: "/products", label: "View all products", variant: "outline" },
  { href: "/#contact", label: "Get in touch", variant: "outline" },
];

/**
 * Conversion-focused CTA strip. Defaults reinforce the homepage flow but
 * each surface (services, why-us, calculator) can pass its own copy.
 */
export function CtaStrip({
  eyebrow = "Ready to move?",
  title = "Plan, price and request your materials in minutes.",
  sub = "Use the calculator for an instant bill of quantities, browse the full catalog, or talk to a real human about your project.",
  actions = DEFAULT_ACTIONS,
}: CtaStripProps = {}) {
  return (
    <section className="cta-strip" aria-label="Quick actions">
      <div className="section-inner cta-strip-inner">
        <div className="cta-strip-copy">
          <p className="cta-strip-eyebrow">{eyebrow}</p>
          <h2 className="cta-strip-title">{title}</h2>
          <p className="cta-strip-sub">{sub}</p>
        </div>
        <div className="cta-strip-actions">
          {actions.map((action) => (
            <Link
              key={`${action.label}-${action.href}`}
              href={action.href}
              className={`${action.variant === "outline" ? "btn-outline" : "btn-primary"} cta-strip-cta`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
