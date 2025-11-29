import { NextRequest, NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import {
  LOCALE_COOKIE_NAME,
  defaultLocale,
  isSupportedLocale,
  locales,
  mapLanguageToLocale,
  type Locale
} from './lib/config/i18n';
import {
  TRACKING_COOKIE_NAME,
  decodeTrackingCookie,
  encodeTrackingCookie,
  extractUtmAndRefFromRequest,
  REF_PARAM_KEYS,
  updateTrackingCookie,
  UTM_PARAM_KEYS
} from './lib/tracking/utm';

// Константы
const SYSTEM_PATHS = ['/api', '/_next', '/_vercel', '/assets', '/.well-known'] as const;
const SHORTLINK_HOST = process.env.NEXT_PUBLIC_SHORTLINK_HOST ?? 'link.maetry.com';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 год
const TRACKING_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 дней

// Инициализация middleware для интернационализации
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(?:${locales.join('|')})(/|$)`);

// Вспомогательные функции
function isSystemPath(pathname: string): boolean {
  return (
    SYSTEM_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname === '/favicon.ico'
  );
}

function normalizeHost(host: string): string {
  return host.replace(/^https?:\/\//, '');
}

function isShortlinkHost(host: string): boolean {
  const normalizedHost = normalizeHost(host);
  const normalizedShortlinkHost = normalizeHost(SHORTLINK_HOST);
  // Явно исключаем localhost и 127.0.0.1
  if (normalizedHost === 'localhost:3000' || normalizedHost === '127.0.0.1:3000' || normalizedHost.startsWith('localhost:') || normalizedHost.startsWith('127.0.0.1:')) {
    return false;
  }
  return normalizedHost === normalizedShortlinkHost;
}

function processTrackingParams(
  req: NextRequest,
  pathname: string
): string | null {
  const { utm, ref } = extractUtmAndRefFromRequest(req);
  const existingCookieRaw = req.cookies.get(TRACKING_COOKIE_NAME)?.value;
  const existingTracking = decodeTrackingCookie(existingCookieRaw ?? null);
  const hasTrackingParams = Boolean(utm) || Boolean(ref);

  if (!hasTrackingParams) {
    return null;
  }

  const updatedTracking = updateTrackingCookie(
    existingTracking,
    utm,
    ref,
    pathname,
    new Date().toISOString()
  );

  const previousEncoded = existingTracking
    ? encodeTrackingCookie(existingTracking)
    : null;
  const nextEncoded = encodeTrackingCookie(updatedTracking);

  // Возвращаем новое значение только если оно изменилось
  return previousEncoded !== nextEncoded ? nextEncoded : null;
}

function cleanTrackingParamsFromUrl(url: URL): void {
  const searchParams = url.searchParams;
  const trackingKeys = new Set<string>();

  // Добавляем UTM параметры
  UTM_PARAM_KEYS.forEach((key) => trackingKeys.add(key));

  // Добавляем REF параметры
  REF_PARAM_KEYS.forEach((key) => trackingKeys.add(key));

  // Удаляем все tracking параметры
  for (const key of Array.from(searchParams.keys())) {
    if (trackingKeys.has(key) || key.startsWith('mt_')) {
      searchParams.delete(key);
    }
  }
}

function setLocaleCookie(response: NextResponse, locale: Locale): void {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE
  });
}

function setTrackingCookie(
  response: NextResponse,
  encodedTracking: string
): void {
  response.cookies.set(TRACKING_COOKIE_NAME, encodedTracking, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TRACKING_COOKIE_MAX_AGE
  });
}

function getLocaleFromRequest(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const localeFromCookie =
    cookieLocale && isSupportedLocale(cookieLocale) ? cookieLocale : undefined;

  return (
    localeFromCookie ??
    mapLanguageToLocale(req.headers.get('accept-language'))
  );
}

function handleShortlinkHost(req: NextRequest, pathname: string): NextResponse | null {
  // Если путь уже начинается с /link/, пропускаем
  if (pathname.startsWith('/link/')) {
    return null;
  }

  // Переписываем путь на /link/{nanoId}
  const cleanPathname = pathname === '/' ? pathname : pathname.replace(/\/$/, '');
  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = `/link${cleanPathname}`;

  return NextResponse.rewrite(rewriteUrl);
}

function handleLocaleRoute(
  req: NextRequest,
  pathname: string,
  encodedTracking: string | null
): NextResponse {
  const response = intlMiddleware(req);
  const localeSegment = pathname.split('/')[1];

  // Обновляем locale cookie если нужно
  if (localeSegment && isSupportedLocale(localeSegment)) {
    const currentLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (currentLocale !== localeSegment) {
      setLocaleCookie(response, localeSegment);
    }
  }

  // Устанавливаем tracking cookie если нужно
  if (encodedTracking) {
    setTrackingCookie(response, encodedTracking);
  }

  return response;
}

function handleRedirectWithoutLocale(
  req: NextRequest,
  pathname: string,
  encodedTracking: string | null
): NextResponse {
  const locale = getLocaleFromRequest(req);

  // Создаем URL для редиректа
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  // Очищаем tracking параметры из query
  cleanTrackingParamsFromUrl(redirectUrl);

  // Создаем response с редиректом
  const redirectResponse = NextResponse.redirect(redirectUrl, 307);

  // Устанавливаем cookies
  setLocaleCookie(redirectResponse, locale);

  if (encodedTracking) {
    setTrackingCookie(redirectResponse, encodedTracking);
  }

  return redirectResponse;
}

// Главная функция middleware
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') ?? '';

  // Пропускаем системные пути без обработки
  if (isSystemPath(pathname)) {
    return NextResponse.next();
  }

  // Пропускаем пути /link/ для обычного хоста (не shortlink)
  // Они обрабатываются отдельным маршрутом app/link/[linkId]/page.tsx
  if (pathname.startsWith('/link/') && !isShortlinkHost(host)) {
    return NextResponse.next();
  }

  // Обработка tracking параметров для всех запросов (включая shortlink)
  // Это нужно сделать до rewrite/redirect, чтобы параметры сохранились
  const encodedTracking = processTrackingParams(req, pathname);

  // Обработка shortlink хоста
  if (isShortlinkHost(host)) {
    const shortlinkResponse = handleShortlinkHost(req, pathname);
    if (shortlinkResponse) {
      // Устанавливаем tracking cookie для shortlink если нужно
      if (encodedTracking) {
        setTrackingCookie(shortlinkResponse, encodedTracking);
      }
      return shortlinkResponse;
    }
    // Если путь уже начинается с /link/, продолжаем обычную обработку
  }

  // Если путь уже содержит локаль
  if (LOCALE_PREFIX_PATTERN.test(pathname)) {
    return handleLocaleRoute(req, pathname, encodedTracking);
  }

  // Путь не содержит локаль - делаем редирект
  return handleRedirectWithoutLocale(req, pathname, encodedTracking);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
