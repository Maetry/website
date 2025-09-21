import { notFound } from 'next/navigation';

import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { StoreProvider } from "@/shared/store";

import { locales } from '../../i18n';

export const metadata: Metadata = {
  title: "Maetry",
  description: "Automate your business processes",
  icons: {
    icon: "/images/favicon.png",
  },
}

export function generateStaticParams(): { locale: string }[] {
  return locales.map((locale: string) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Проверяем, что локаль поддерживается
  if (!locales.includes(locale as 'ru' | 'en')) {
    notFound();
  }

  // Получаем сообщения для текущей локали
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <StoreProvider>{children}</StoreProvider>
    </NextIntlClientProvider>
  )
}
