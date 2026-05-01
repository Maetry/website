"use client";

import { usePathname } from "next/navigation";

import { MarketingFooter } from "./MarketingFooter";
import type { MarketingFooterProps } from "./MarketingFooter";

function shouldHideMarketingFooter(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return (
    p.includes("/booking/") ||
    p.includes("/billing") ||
    p.includes("/invite/client/") ||
    p.includes("/client/invite") ||
    p.includes("/console/invite/employee/") ||
    p.includes("/console/invite/salon/") ||
    p.includes("/staff/invite") ||
    p.includes("/visit/") ||
    p.includes("/visits/")
  );
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
