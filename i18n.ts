import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Список поддерживаемых локалей
export const locales = ['ru', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

// Локаль по умолчанию
export const defaultLocale: Locale = 'ru';

// Статические импорты локализации
import ruMessages from './locales/ru.json';
import enMessages from './locales/en.json';
import esMessages from './locales/es.json';

export default getRequestConfig(async ({ locale }) => {
  // Проверяем, что локаль поддерживается
  if (!locale || !locales.includes(locale as any)) {
    // Возвращаем дефолтную локаль вместо notFound()
    locale = defaultLocale;
  }

  let messages;
  if (locale === 'ru') {
    messages = ruMessages;
  } else if (locale === 'en') {
    messages = enMessages;
  } else if (locale === 'es') {
    messages = esMessages;
  } else {
    // Fallback на русскую локаль
    messages = ruMessages;
  }

  return {
    locale,
    messages
  };
});
