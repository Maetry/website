import { notFound } from 'next/navigation';

import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { StoreProvider } from "@/shared/store";

import { locales, isSupportedLocale, type Locale } from '../../i18n';

export const metadata: Metadata = {
  title: "Maetry",
  description: "Automate your business processes",
  icons: {
    icon: "/images/favicon.png",
  },
}

export function generateStaticParams(): { locale: Locale }[] {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Проверяем, что локаль поддерживается
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <StoreProvider>{children}</StoreProvider>
    </NextIntlClientProvider>
  )
}
