import { headers } from "next/headers";

import { getLocale, getTranslations } from "next-intl/server";

import { Header } from "@/features/header";
import {
  buildAppStoreUrl,
  getBusinessHref,
  getConsumerHomeHref,
  getMarketingContent,
  INSTAGRAM_URL,
  normalizeMarketingLocale,
  SUPPORT_EMAIL_HREF,
  TELEGRAM_URL,
  withDiscoverHash,
} from "@/features/home-experience/model/content";
import { MarketingFooter, MarketingPageShell } from "@/shared/chakra/marketing";

import { AffiliateMarketingView } from "./AffiliateMarketingView";

export default async function AffiliatePage() {
  const locale = await getLocale();
  const t = await getTranslations("ambassador");
  const host = (await headers()).get("host");
  const normalizedLocale = normalizeMarketingLocale(locale);
  const content = getMarketingContent(normalizedLocale);
  const consumerHref = getConsumerHomeHref(host, normalizedLocale);
  const businessHref = getBusinessHref(host, normalizedLocale);
  const appHref = buildAppStoreUrl("consumer_home");

  const emailSubject = encodeURIComponent(t("email.subject"));
  const emailBody = encodeURIComponent(t("email.body"));
  const mailtoHref = `mailto:info@maetry.com?subject=${emailSubject}&body=${emailBody}`;
  const headerNav = [
    { href: "#offer", label: t("offerLabel") },
    { href: "#partner-proof", label: t("gridTitle") },
    { href: "#apply", label: t("startEarning") },
  ];

  return (
    <MarketingPageShell>
      <Header
        nav={headerNav}
        primaryAction={{
          href: mailtoHref,
          label: t("becomePartner"),
          tone: "primary",
        }}
        secondaryAction={{ href: `/${locale}`, label: "Maetry", tone: "secondary" }}
        logoHref={`/${locale}`}
        navStyle="inline"
        showThemeSwitcher={false}
        showLocaleSwitcher={false}
      />
      <AffiliateMarketingView mailtoHref={mailtoHref} />
      <MarketingFooter
        mode="landing"
        tagline={content.consumer.footerTagline}
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
