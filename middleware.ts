import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // Список поддерживаемых локалей
  locales,
  
  // Локаль по умолчанию
  defaultLocale,
  
  // Стратегия локализации
  localeDetection: true,
  
  // Префикс локали в URL (всегда показываем префикс)
  localePrefix: 'always'
});

export const config = {
  // Применяем middleware ко всем путям, кроме статических файлов и API
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
