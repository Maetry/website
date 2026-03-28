import { Header } from "@/features/header";
import {
  MarketingFooter,
  MarketingPageShell,
} from "@/shared/chakra/marketing";

import {
  INSTAGRAM_URL,
  SUPPORT_EMAIL_HREF,
  TELEGRAM_URL,
  buildAppStoreUrl,
  getBusinessHref,
  getConsumerHomeHref,
  getMarketingContent,
  normalizeMarketingLocale,
  withDiscoverHash,
  type SiteExperience,
} from "../model/content";

function withSectionHash(href: string, sectionId: string): string {
  const base = href.includes("#") ? href.slice(0, href.indexOf("#")) : href;
  const id = sectionId.replace(/^#/, "");
  return `${base}#${id}`;
}

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
  const consumerHref = getConsumerHomeHref(host, normalizedLocale);
  const appHref = buildAppStoreUrl(
    isBusiness ? "business_landing" : "consumer_home",
  );

  const nav = isBusiness ? content.business.nav : content.consumer.nav;
  const headerNav = nav.map((item) =>
    !isBusiness && item.href === "#download"
      ? { href: appHref, label: item.label }
      : { href: item.href, label: item.label },
  );
  const headerPrimaryAction = {
    href: appHref,
    label: content.common.appStoreLabel,
    tone: "primary" as const,
  };
  const headerSecondaryAction = isBusiness
    ? undefined
    : {
        href: withSectionHash(consumerHref, "download"),
        label: content.common.businessLabel,
        tone: "secondary" as const,
        linkVariant: "secondaryGhost" as const,
      };
  const logoHref = isBusiness ? businessHref : consumerHref;

  return (
    <MarketingPageShell>
      <Header
        nav={headerNav}
        primaryAction={headerPrimaryAction}
        secondaryAction={headerSecondaryAction}
        logoHref={logoHref}
        showThemeSwitcher={false}
        showLocaleSwitcher={false}
        navStyle="inline"
      />
      <HomeExperienceView
        content={content}
        isBusiness={isBusiness}
        businessHref={businessHref}
        appHref={appHref}
      />
      <MarketingFooter
        mode="landing"
        tagline={
          isBusiness
            ? content.business.footerTagline
            : content.consumer.footerTagline
        }
        businessHref={businessHref}
        appHref={appHref}
        consumerLabel={content.common.consumerLabel}
        businessSectionTitle={content.common.footerBusinessSectionTitle}
        appStoreLabel={content.common.appStoreLabel}
        contactLabel={content.common.contactLabel}
        partnershipLabel={content.common.partnershipLabel}
        privacyLabel={content.common.privacyLabel}
        termsLabel={content.common.termsLabel}
        languageLabel={content.common.languageLabel}
        legalSectionLabel={content.common.legalSectionLabel}
        footerRights={content.common.footerRights}
        telegramLabel="Telegram"
        instagramLabel="Instagram"
        telegramHref={TELEGRAM_URL}
        instagramHref={INSTAGRAM_URL}
        supportMailHref={SUPPORT_EMAIL_HREF}
        activeLocale={normalizedLocale}
        discoverHref={withDiscoverHash(consumerHref)}
        discoverLabel={content.consumer.nav[0]?.label ?? "Discover"}
        businessSiteLabel={content.common.businessSubdomainLabel}
      />
    </MarketingPageShell>
  );
}
