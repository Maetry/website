import { headers } from "next/headers";

import { getLocale, getTranslations } from "next-intl/server";

import { MarketingPageHeader } from "@/features/header";
import { getMarketingContent } from "@/features/home-experience/model/content";
import { buildAffiliateHeaderProps } from "@/features/home-experience/model/marketingHeader";
import { MarketingPageShell } from "@/shared/chakra/marketing";

import { AffiliateMarketingView } from "./AffiliateMarketingView";

export default async function AffiliatePage() {
  const locale = await getLocale();
  const t = await getTranslations("ambassador");
  const host = (await headers()).get("host");
  const content = getMarketingContent(locale);

  const emailSubject = encodeURIComponent(t("email.subject"));
  const emailBody = encodeURIComponent(t("email.body"));
  const mailtoHref = `mailto:info@maetry.com?subject=${emailSubject}&body=${emailBody}`;

  const headerProps = buildAffiliateHeaderProps({
    host,
    locale,
    content,
    mailtoHref,
    copy: {
      offerLabel: t("offerLabel"),
      gridTitle: t("gridTitle"),
      startEarning: t("startEarning"),
      becomePartner: t("becomePartner"),
    },
  });

  return (
    <MarketingPageShell>
      <MarketingPageHeader
        nav={headerProps.nav}
        primaryAction={headerProps.primaryAction}
        logoHref={headerProps.logoHref}
      />
      <AffiliateMarketingView mailtoHref={mailtoHref} />
    </MarketingPageShell>
  );
}
