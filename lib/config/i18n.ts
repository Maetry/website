export const locales = ['en', 'ru', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export function isSupportedLocale(locale: string | null | undefined): locale is Locale {
  if (!locale) {
    return false;
  }

  return (locales as readonly string[]).includes(locale);
}

export function mapLanguageToLocale(lang: string | undefined | null): Locale {
  if (!lang) {
    return defaultLocale;
  }

  const normalized = lang.split(',')[0]?.toLowerCase().trim() ?? '';

  if (normalized.startsWith('ru')) {
    return 'ru';
  }

  if (normalized.startsWith('es')) {
    return 'es';
  }

  return defaultLocale;
}

