import "server-only";

import { BILLING_PLAN_FEATURE_TITLES_BY_CODE } from "@/lib/generated/billing-plan-features.gen";

export type BillingPlanFeatureTitlesByCode = Record<string, string[]>;

export async function loadBillingPlanFeatureTitles(): Promise<BillingPlanFeatureTitlesByCode> {
  return Object.fromEntries(
    Object.entries(BILLING_PLAN_FEATURE_TITLES_BY_CODE).map(([planCode, features]) => [
      planCode,
      [ ...features ],
    ]),
  );
}
