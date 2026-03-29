import { MarketingPageHeader } from "@/features/header";
import { MarketingPageShell } from "@/shared/chakra/marketing";

import {
  buildAppStoreUrl,
  getBusinessHref,
  getMarketingContent,
  normalizeMarketingLocale,
  type SiteExperience,
} from "../model/content";
import { buildHomeExperienceHeaderProps } from "../model/marketingHeader";

import { HomeExperienceView } from "./HomeExperienceView";

type HomeExperienceProps = {
  locale: string;
  experience: SiteExperience;
  host: string | null;
  routeVariant: "home" | "business-path" | "business-host";
};

export function HomeExperience({
  locale,
  experience,
  host,
  routeVariant,
}: HomeExperienceProps) {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const content = getMarketingContent(normalizedLocale);
  const isBusiness = experience === "business";
  const businessHref =
    routeVariant === "business-host"
      ? `https://business.maetry.com/${normalizedLocale}`
      : getBusinessHref(host, normalizedLocale);
  const appHref = buildAppStoreUrl(
    isBusiness ? "business_landing" : "consumer_home",
  );

  const headerProps = buildHomeExperienceHeaderProps({
    locale,
    experience,
    host,
    routeVariant,
  });

  return (
    <MarketingPageShell>
      <MarketingPageHeader
        nav={headerProps.nav}
        primaryAction={headerProps.primaryAction}
        secondaryAction={headerProps.secondaryAction}
        logoHref={headerProps.logoHref}
      />
      <HomeExperienceView
        content={content}
        isBusiness={isBusiness}
        businessHref={businessHref}
        appHref={appHref}
      />
    </MarketingPageShell>
  );
}
