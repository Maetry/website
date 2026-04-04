import type { ReactNode } from "react";

import { headers } from "next/headers";

import { GlobalMarketingFooter } from "@/shared/chakra/marketing/GlobalMarketingFooter";
import { AppThemeProvider } from "@/shared/ui/theme-switcher";

import { isSupportedLocale, type Locale } from "../../../i18n";

const SHORTLINK_HOST = process.env.NEXT_PUBLIC_SHORTLINK_HOST ?? "link.maetry.com";

function normalizeHost(host: string): string {
  return host.replace(/^https?:\/\//, "");
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isShortlinkSurface = normalizeHost(host) === normalizeHost(SHORTLINK_HOST);
  const footerLocale: Locale = isSupportedLocale(locale) ? locale : "en";

  return (
    <AppThemeProvider>
      {children}
      {!isShortlinkSurface ? <GlobalMarketingFooter locale={footerLocale} /> : null}
    </AppThemeProvider>
  );
}
