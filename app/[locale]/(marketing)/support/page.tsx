import { headers } from "next/headers";

import { getTranslations } from "next-intl/server";

import { MarketingPageHeader } from "@/features/header";
import {
  buildAppStoreUrl,
  getBusinessHref,
  getConsumerHomeHref,
  SUPPORT_EMAIL_HREF,
  TELEGRAM_URL,
} from "@/features/home-experience/model/content";
import { MarketingPageShell } from "@/shared/chakra/marketing";

import { SupportPageView } from "./SupportPageView";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");
  const t = await getTranslations({ locale, namespace: "support.header" });

  return (
    <MarketingPageShell>
      <MarketingPageHeader
        nav={[
          { href: "#roles", label: t("roles") },
          { href: "#support-form", label: t("form") },
        ]}
        primaryAction={{ href: SUPPORT_EMAIL_HREF, label: t("emailAction") }}
        secondaryAction={{ href: buildAppStoreUrl("support_page"), label: t("appAction") }}
        logoHref={getConsumerHomeHref(host, locale)}
      />
      <SupportPageView
        appHref={buildAppStoreUrl("support_page")}
        businessHref={getBusinessHref(host, locale)}
        consumerHref={getConsumerHomeHref(host, locale)}
        locale={locale}
        supportMailHref={SUPPORT_EMAIL_HREF}
        telegramHref={TELEGRAM_URL}
      />
    </MarketingPageShell>
  );
}
