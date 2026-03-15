"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "@/shared/ui/locale/LanguageSwitcher";
import ThemeSwitcher from "@/shared/ui/theme-switcher/ThemeSwitcher";

import type { HeaderAction, HeaderLink } from "./types";

function cx(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(" ");
}

function isExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function MenuLink({
  href,
  label,
  onClick,
  tone = "secondary",
}: HeaderAction & { onClick?: () => void }) {
  const className = cx(
    "inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-colors",
    tone === "primary"
      ? "bg-[#13131A] text-white hover:bg-[#1f2533] dark:bg-white dark:text-[#13131A] dark:hover:bg-[#f2f4f8]"
      : "border border-[#13131A]/10 bg-white/80 text-[#13131A] hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/14",
  );

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}

interface HeaderMenuProps {
  nav: HeaderLink[];
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
}

const HeaderMenu = ({
  nav,
  primaryAction,
  secondaryAction,
}: HeaderMenuProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#13131A]/10 bg-white/80 text-[#13131A] shadow-[0_16px_40px_rgba(19,19,26,0.08)] transition-colors hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/14"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cx("transition-transform duration-200", isOpen && "rotate-90")}
        >
          {isOpen ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-[#13131A]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,248,252,0.94))] p-4 shadow-[0_30px_90px_rgba(19,19,26,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,17,24,0.98),rgba(19,21,31,0.96))]">
          <nav className="grid gap-2">
            {nav.map((item) => (
              <MenuLink
                key={item.href}
                href={item.href}
                label={item.label}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-[#13131A]/8 bg-white/75 px-3 py-3 dark:border-white/10 dark:bg-white/6">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <div className="mt-4 grid gap-2">
            {secondaryAction ? (
              <MenuLink
                {...secondaryAction}
                onClick={() => setIsOpen(false)}
              />
            ) : null}
            {primaryAction ? (
              <MenuLink
                {...primaryAction}
                tone="primary"
                onClick={() => setIsOpen(false)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HeaderMenu;
