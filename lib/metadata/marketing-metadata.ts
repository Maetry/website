import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { generateAlternateLinks } from './alternate-links';

type MarketingPage = 'home' | 'business' | 'affiliate';

const pageToPath: Record<MarketingPage, string> = {
  home: '',
  business: '/business',
  affiliate: '/affiliate',
};

export async function generateMarketingMetadata(
  locale: string,
  page: MarketingPage,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${page}` });
  const path = pageToPath[page];
  const alternates = generateAlternateLinks(path);

  const ogLocale =
    locale === 'ru' ? 'ru_RU' : locale === 'es' ? 'es_ES' : 'en_US';

  return {
    title: t('title'),
    description: t('description'),
    alternates,
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: alternates.canonical,
      siteName: 'Maetry',
      locale: ogLocale,
      type: 'website',
      images: [{ url: 'https://maetry.com/logo.png', alt: 'Maetry' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://maetry.com/logo.png'],
    },
  };
}
