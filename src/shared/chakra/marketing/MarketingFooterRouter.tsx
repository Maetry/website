"use client";

import { usePathname } from "next/navigation";

import { MarketingFooter } from "./MarketingFooter";
import type { MarketingFooterProps } from "./MarketingFooter";

function shouldHideMarketingFooter(pathname: string): boolean {
  const p = pathname.toLowerCase();

  // Показываем footer ТОЛЬКО на этих страницах:
  // - главная /{locale}
  // - /{locale}/business
  // - /{locale}/affiliate
  // Все остальные страницы (booking, visits, support, checkout и т.д.) - без футера
  const isAllowedPage =
    p === "/" ||
    p === "/en" ||
    p === "/ru" ||
    p === "/es" ||
    p.includes("/business") ||
    p.includes("/affiliate");

  return !isAllowedPage;
}

export function MarketingFooterRouter({
  consumer,
  business,
  initialBusinessByHost,
}: {
  consumer: MarketingFooterProps;
  business: MarketingFooterProps;
  initialBusinessByHost: boolean;
}) {
  const pathname = usePathname() ?? "";
  if (shouldHideMarketingFooter(pathname)) {
    return null;
  }

  const pathBusiness = pathname.includes("/business");
  const props =
    initialBusinessByHost || pathBusiness ? business : consumer;

  return <MarketingFooter {...props} />;
}
