import type { ReactNode } from "react";

import { GlobalMarketingFooter } from "@/shared/chakra/marketing/GlobalMarketingFooter";
import { AppThemeProvider } from "@/shared/ui/theme-switcher";

import { isSupportedLocale, type Locale } from "../../../i18n";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const footerLocale: Locale = isSupportedLocale(locale) ? locale : "en";

  return (
    <AppThemeProvider>
      {children}
      <GlobalMarketingFooter locale={footerLocale} />
    </AppThemeProvider>
  );
}
