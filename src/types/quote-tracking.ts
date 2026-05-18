/** Public quote tracking payload from `/api/track/quote/[id]` or `/api/user/quotes/[id]`. */
export type QuoteTrackResponse = {
  id: string;
  kind: string;
  status: string;
  paymentStatus: string;
  paymentLabel: string;
  totalPrice: number | null;
  deliveryLocation: string | null;
  createdAt: string;
  updatedAt: string;
  summary: string;
};
