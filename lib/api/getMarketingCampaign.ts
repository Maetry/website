"use client";

import { clientApiRequest } from "./client";
import type { MarketingCampaign } from "./types";

export async function getMarketingCampaign(nanoId: string): Promise<MarketingCampaign> {
  if (!nanoId) {
    throw new Error("NanoId is required");
  }

  return clientApiRequest<MarketingCampaign>({
    endpoint: `/api/marketing/campaigns/by-link/${encodeURIComponent(nanoId)}`,
    method: "GET",
  });
}

