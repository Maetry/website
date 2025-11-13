import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isSupportedLocale, type Locale } from './lib/config/i18n';
import enMessages from './locales/en.json';
import esMessages from './locales/es.json';
import ruMessages from './locales/ru.json';

const messagesByLocale = {
  en: enMessages,
  ru: ruMessages,
  es: esMessages
} satisfies Record<Locale, typeof enMessages>;

export { locales, defaultLocale, type Locale, isSupportedLocale } from './lib/config/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Проверяем, что локаль поддерживается
  const resolvedLocale = locale && isSupportedLocale(locale) ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: messagesByLocale[resolvedLocale] ?? messagesByLocale[defaultLocale]
  };
});
