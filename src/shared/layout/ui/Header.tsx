import { getLocale, getTranslations } from "next-intl/server";

import { MarketingHeader } from "./MarketingHeader";
import type { HeaderAction, HeaderLink } from "./types";

export type HeaderProps = {
  nav?: HeaderLink[];
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
  logoHref?: string;
  showThemeSwitcher?: boolean;
  showLocaleSwitcher?: boolean;
  navStyle?: "pill" | "inline";
};

const Header = async ({
  nav,
  primaryAction,
  secondaryAction,
  logoHref,
  showThemeSwitcher,
  showLocaleSwitcher,
  navStyle,
}: HeaderProps) => {
  const locale = await getLocale();
  const navT = await getTranslations("navigation");
  const headerT = await getTranslations("header");

  const resolvedNav =
    nav ??
    [
      { href: `/${locale}/#about`, label: navT("about") },
      { href: `/${locale}/#reviews`, label: navT("reviews") },
      { href: `/${locale}/#features`, label: navT("features") },
      { href: `/${locale}/#pricing`, label: navT("pricing") },
    ];
  const resolvedPrimaryAction =
    primaryAction ??
    ({
      href: "https://console.maetry.com/auth",
      label: headerT("freeTrial"),
      tone: "primary",
    } as const);
  const resolvedLogoHref = logoHref ?? `/${locale}`;

  return (
    <MarketingHeader
      nav={resolvedNav}
      primaryAction={resolvedPrimaryAction}
      secondaryAction={secondaryAction}
      logoHref={resolvedLogoHref}
      showThemeSwitcher={showThemeSwitcher}
      showLocaleSwitcher={showLocaleSwitcher}
      navStyle={navStyle}
    />
  );
};

export default Header;
