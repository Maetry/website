export interface BillingPlan {
  id: string;
  name: string;
  pricePerSpecialist: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface CheckoutRequest {
  salonId: string;
  staffCount: number;
  planId: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}
