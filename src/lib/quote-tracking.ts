import type { QuoteRequest } from "@/types/galana-firestore";

/** Short customer-facing line for fulfilment / payment progress */
export function quoteTrackingSummary(q: QuoteRequest): string {
  const pay = q.paymentStatus;
  switch (q.status) {
    case "processing":
      return pay === "paid"
        ? "Payment received — our team will update your quote and delivery details shortly."
        : "We're reviewing your request.";
    case "quoted":
      return pay === "paid"
        ? "Payment received — your order will move into confirmation and scheduling."
        : "Your quote is ready — complete payment to confirm.";
    case "confirmed":
      return pay === "paid"
        ? "Order confirmed — delivery or pickup will follow the logistics plan on your quote."
        : "This quote was confirmed internally — payments will show once completed.";
    case "declined":
      return "This quote was not taken forward.";
    case "archived":
      return "This request has been archived.";
    default:
      return "Status updated.";
  }
}
