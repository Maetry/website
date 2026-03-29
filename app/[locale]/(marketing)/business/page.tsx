import { headers } from "next/headers";

import { BusinessMarketingView } from "./BusinessMarketingView";

export default async function BusinessLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");

  return <BusinessMarketingView locale={locale} host={host} />;
}
