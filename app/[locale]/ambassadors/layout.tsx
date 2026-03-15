import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.ambassador' });
  const canonical = `https://maetry.com/${locale}/ambassadors`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical,
      languages: {
        en: 'https://maetry.com/en/ambassadors',
        ru: 'https://maetry.com/ru/ambassadors',
        es: 'https://maetry.com/es/ambassadors',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonical,
      type: 'website',
      siteName: 'Maetry',
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

export default function AmbassadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
