import type { HeaderAction, HeaderLink } from "@/shared/layout/ui/types";

import {
  buildAppStoreUrl,
  getBusinessHref,
  getConsumerHomeHref,
  getMarketingContent,
  normalizeMarketingLocale,
  type LocaleContent,
  type SiteExperience,
} from "./content";

function withSectionHash(href: string, sectionId: string): string {
  const base = href.includes("#") ? href.slice(0, href.indexOf("#")) : href;
  const id = sectionId.replace(/^#/, "");
  return `${base}#${id}`;
}

/** Пропсы шапки лендинга: логотип, навигация (якорь / страница / mailto / внешняя ссылка), крайняя CTA. */
export function buildHomeExperienceHeaderProps(args: {
  locale: string;
  experience: SiteExperience;
  host: string | null;
  routeVariant: "home" | "business-path" | "business-host";
}): {
  nav: HeaderLink[];
  primaryAction: HeaderAction;
  secondaryAction?: HeaderAction;
  logoHref: string;
} {
  const normalizedLocale = normalizeMarketingLocale(args.locale);
  const content = getMarketingContent(normalizedLocale);
  const isBusiness = args.experience === "business";
  const businessHref =
    args.routeVariant === "business-host"
      ? `https://business.maetry.com/${normalizedLocale}`
      : getBusinessHref(args.host, normalizedLocale);
  const consumerHref = getConsumerHomeHref(args.host, args.locale);
  const appHref = buildAppStoreUrl(
    isBusiness ? "business_landing" : "consumer_home",
  );

  const nav = isBusiness ? content.business.nav : content.consumer.nav;
  // Пункт «Get the app» только как primary CTA справа, не дублируем в nav (иначе два разных стиля ссылки).
  const headerNav = (isBusiness
    ? nav
    : nav.filter((item) => item.href !== "#download")
  ).map((item) => ({ href: item.href, label: item.label }));

  return {
    nav: headerNav,
    primaryAction: {
      href: appHref,
      label: content.common.appStoreLabel,
      tone: "primary",
    },
    secondaryAction: isBusiness
      ? undefined
      : {
          href: withSectionHash(consumerHref, "download"),
          label: content.common.businessLabel,
          tone: "secondary",
          linkVariant: "secondaryGhost",
        },
    logoHref: isBusiness ? businessHref : consumerHref,
  };
}

export type AffiliateHeaderCopy = {
  offerLabel: string;
  gridTitle: string;
  startEarning: string;
  becomePartner: string;
};

export function buildAffiliateHeaderProps(args: {
  host: string | null;
  locale: string;
  content: LocaleContent;
  copy: AffiliateHeaderCopy;
  mailtoHref: string;
}): {
  nav: HeaderLink[];
  primaryAction: HeaderAction;
  logoHref: string;
} {
  const homeHref = getConsumerHomeHref(args.host, args.locale);
  return {
    nav: [
      { href: "#offer", label: args.copy.offerLabel },
      { href: "#partner-proof", label: args.copy.gridTitle },
      { href: "#apply", label: args.copy.startEarning },
    ],
    primaryAction: {
      href: args.mailtoHref,
      label: args.copy.becomePartner,
      tone: "primary",
    },
    logoHref: homeHref,
  };
}
