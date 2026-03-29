import { headers } from "next/headers";

import { buildMarketingFooterPair } from "@/features/home-experience/model/content";

import { MarketingFooterRouter } from "./MarketingFooterRouter";

export async function GlobalMarketingFooter({ locale }: { locale: string }) {
  const host = (await headers()).get("host");
  const isBusinessHost = (host?.toLowerCase() ?? "").includes(
    "business.maetry.com",
  );
  const pair = buildMarketingFooterPair(host, locale);

  return (
    <MarketingFooterRouter
      consumer={pair.consumer}
      business={pair.business}
      initialBusinessByHost={isBusinessHost}
    />
  );
}
