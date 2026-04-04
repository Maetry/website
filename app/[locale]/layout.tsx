import { headers } from "next/headers";
import { notFound } from "next/navigation";

import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { FirebaseTracker } from "@/lib/firebase";
import { PlatformProvider } from "@/lib/userAgent/PlatformProvider";
import { QueryProvider } from "@/shared/query/QueryProvider";

import { locales, isSupportedLocale, type Locale } from '../../i18n';

const localeMetadata: Record<Locale, { description: string }> = {
  en: {
    description: "Salon management software and beauty booking marketplace",
  },
  ru: {
    description: "Система управления салоном и маркетплейс для записи на бьюти-услуги",
  },
  es: {
    description: "Software de gestión para salones y marketplace de reservas de belleza",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metadata =
    isSupportedLocale(locale) ? localeMetadata[locale] : localeMetadata.en;

  return {
    title: "Maetry",
    description: metadata.description,
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/images/favicon.png", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png" },
      ],
    },
  };
}

export function generateStaticParams(): { locale: Locale }[] {
  return locales.map((locale) => ({ locale }));
}

/** Чтобы env(safe-area-inset-*) работали на iOS (футер до края экрана). */
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";

  // Проверяем, что локаль поддерживается
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <QueryProvider>
        <PlatformProvider userAgent={userAgent}>
          <FirebaseTracker />
          {children}
        </PlatformProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  )
}
