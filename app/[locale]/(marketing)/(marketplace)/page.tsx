import { headers } from "next/headers";

import { MarketplaceMarketingView } from "./MarketplaceMarketingView";

export default async function MarketplaceLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");

  return <MarketplaceMarketingView locale={locale} host={host} />;
}
