export type AdminRole = "admin" | "staff";

export type QuoteRequestKind = "quote" | "order";

/** Lifecycle for items submitted from the site backend. */
export type QuoteRequestStatus =
  | "processing"
  | "quoted"
  | "confirmed"
  | "declined"
  | "archived";

export interface AdminProfile {
  email: string;
  displayName: string;
  role: AdminRole;
  phone?: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  /** ISO timestamps when read from API JSON */
  createdAt?: string;
  updatedAt?: string;
}

/** Payload shape from quote flows (calculator, cart, contact form). */
export interface SiteQuotePayload {
  /** All contact fields optional — user may send cart-only or message-only inquiries. */
  fromEmail: string;
  fromPhone?: string;
  /** Customer site / delivery location (free text). */
  location?: string;
  fullName?: string;
  company?: string;
  inquiryCategory?: string;
  inquiryMessage?: string;
  calculator: {
    lines: string[];
    activeMainTab: string;
  };
  cart: Array<{
    productId: string;
    name: string;
    category: string;
    qty: number;
    lineNote: string;
  }>;
  pageUrl: string;
  kind?: QuoteRequestKind;
  /** Where the request was submitted from (analytics / routing). */
  source?: "calculator" | "cart" | "contact";
}

export interface QuoteRequest {
  id: string;
  kind: QuoteRequestKind;
  status: QuoteRequestStatus;
  fromEmail: string;
  /** Duplicated from payload for quick admin list views (optional on legacy docs). */
  fromPhone?: string;
  customerLocation?: string;
  pageUrl: string;
  payload: SiteQuotePayload;
  internalNote?: string;
  lastUpdatedBy?: string;
  /** Total price in KES (optional until quoted). */
  totalPrice?: number;
  /** Payment status: pending, paid, failed. */
  paymentStatus?: 'pending' | 'paid' | 'failed';
  /** Paystack payment reference (if any). */
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}
