import type {
  BillingCatalogCadenceOffer,
  BillingCatalogPlanItem,
  BillingPlanIntervalValue,
  BillingPrice,
  BillingTier,
} from "./maetry-contracts";

export type BillingTierLine = {
  rangeTitle: string;
  seatCount: number;
  subtotal: BillingPrice;
  unitPrice: BillingPrice;
};

export type BillingPriceBreakdown = {
  basePrice: BillingPrice;
  billableAdditionalSeats: number;
  includedSeats: number;
  tierLines: BillingTierLine[];
  totalPrice: BillingPrice;
  totalSeats: number;
};

export function getBillingOffer(
  plan: BillingCatalogPlanItem,
  interval: BillingPlanIntervalValue,
): BillingCatalogCadenceOffer | null {
  return interval === "yearly" ? plan.yearly ?? null : plan.monthly ?? null;
}

function getTierTitle(tier: BillingTier): string {
  if (tier.toSeat === null || tier.toSeat === undefined) {
    return `${tier.fromSeat}+ seats`;
  }

  if (tier.fromSeat === tier.toSeat) {
    return `${tier.fromSeat} seat`;
  }

  return `${tier.fromSeat}-${tier.toSeat} seats`;
}

export function calculateBillingBreakdown(
  offer: BillingCatalogCadenceOffer,
  totalSeats: number,
): BillingPriceBreakdown {
  const normalizedSeats = Math.max(totalSeats, offer.includedSeats);
  const additionalSeats = Math.max(0, normalizedSeats - offer.includedSeats);
  const matchingTier =
    additionalSeats > 0
      ? offer.seatTiers.find(
          (tier) =>
            normalizedSeats >= tier.fromSeat &&
            normalizedSeats <= (tier.toSeat ?? normalizedSeats),
        ) ?? null
      : null;

  const tierLines: BillingTierLine[] =
    additionalSeats > 0 && matchingTier
      ? [
          {
            rangeTitle: getTierTitle(matchingTier),
            seatCount: additionalSeats,
            subtotal: {
              amount: matchingTier.seatPrice.amount * additionalSeats,
              currency: matchingTier.seatPrice.currency,
            },
            unitPrice: matchingTier.seatPrice,
          },
        ]
      : [];

  const additionalSubtotal = tierLines.reduce(
    (sum, line) => sum + line.subtotal.amount,
    0,
  );

  return {
    basePrice: offer.basePrice,
    billableAdditionalSeats: additionalSeats,
    includedSeats: offer.includedSeats,
    tierLines,
    totalPrice: {
      amount: offer.basePrice.amount + additionalSubtotal,
      currency: offer.basePrice.currency,
    },
    totalSeats: normalizedSeats,
  };
}
