import Image from "next/image";
import Link from "next/link";

import { getLocale, getTranslations } from "next-intl/server";

import logo from "@/public/images/logo.svg";
import LanguageSwitcher from "@/shared/ui/locale/LanguageSwitcher";
import ThemeSwitcher from "@/shared/ui/theme-switcher/ThemeSwitcher";

import HeaderMenu from "./HeaderMenu";
import type { HeaderAction, HeaderLink } from "./types";

function cx(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(" ");
}

function isExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function NavLink({ href, label }: HeaderLink) {
  const className =
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#13131A]/72 transition-colors hover:bg-white hover:text-[#13131A] dark:text-white/72 dark:hover:bg-white/10 dark:hover:text-white";

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function ActionLink({
  href,
  label,
  tone = "secondary",
}: HeaderAction) {
  const className = cx(
    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
    tone === "primary"
      ? "bg-[#13131A] text-white hover:bg-[#1f2533] dark:bg-white dark:text-[#13131A] dark:hover:bg-[#f2f4f8]"
      : "border border-[#13131A]/10 bg-white/80 text-[#13131A] hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/14",
  );

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

interface HeaderProps {
  nav?: HeaderLink[];
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
  logoHref?: string;
}

const Header = async ({
  nav,
  primaryAction,
  secondaryAction,
  logoHref,
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
    {
      href: "https://console.maetry.com/auth",
      label: headerT("freeTrial"),
      tone: "primary",
    };
  const resolvedLogoHref = logoHref ?? `/${locale}`;

  return (
    <div className="sticky top-0 z-[2500] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-visible rounded-[26px] border border-[#13131A]/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,250,252,0.88))] shadow-[0_20px_70px_rgba(19,19,26,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,14,20,0.92),rgba(16,19,27,0.88))]">
          <div className="hidden items-center gap-4 px-4 py-3 lg:flex">
            <Link href={resolvedLogoHref} className="flex shrink-0 items-center">
              <Image
                src={logo}
                alt="Maetry"
                width={112}
                height={22}
                className="h-auto w-[112px] dark:invert"
                priority
              />
            </Link>

            <nav className="mx-auto flex items-center gap-1 rounded-full border border-[#13131A]/8 bg-white/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/10 dark:bg-white/6">
              {resolvedNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-[#13131A]/8 bg-white/72 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/10 dark:bg-white/6 xl:flex">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>

              {secondaryAction ? <ActionLink {...secondaryAction} /> : null}
              {resolvedPrimaryAction ? (
                <ActionLink {...resolvedPrimaryAction} tone="primary" />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
            <Link href={resolvedLogoHref} className="flex shrink-0 items-center">
              <Image
                src={logo}
                alt="Maetry"
                width={112}
                height={22}
                className="h-auto w-[112px] dark:invert"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              <HeaderMenu
                nav={resolvedNav}
                secondaryAction={secondaryAction}
                primaryAction={resolvedPrimaryAction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
