import { locales, defaultLocale } from '../config/i18n';

const BASE_URL = 'https://maetry.com';

export function generateAlternateLinks(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  languages['x-default'] = `${BASE_URL}/${defaultLocale}${path}`;

  return {
    canonical: `${BASE_URL}/${defaultLocale}${path}`,
    languages,
  };
}
