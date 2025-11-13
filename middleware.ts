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
  updateTrackingCookie
} from './lib/tracking/utm';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(?:${locales.join('|')})(/|$)`);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get('host') ?? '';
  const shortlinkHost = process.env.NEXT_PUBLIC_SHORTLINK_HOST ?? 'link.maetry.com';

  if (host === shortlinkHost) {
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/_vercel') ||
      pathname.startsWith('/assets') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    if (pathname.startsWith('/link')) {
      return NextResponse.next();
    }

    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = `/link${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const { utm, ref } = extractUtmAndRefFromRequest(req);
  const existingCookieRaw = req.cookies.get(TRACKING_COOKIE_NAME)?.value;
  const existingTracking = decodeTrackingCookie(existingCookieRaw ?? null);
  const hasTrackingParams = Boolean(utm) || Boolean(ref);

  let encodedUpdatedTracking: string | null = null;

  if (hasTrackingParams) {
    const updatedTracking = updateTrackingCookie(
      existingTracking,
      utm,
      ref,
      pathname,
      new Date().toISOString()
    );

    const previousEncoded = existingTracking ? encodeTrackingCookie(existingTracking) : null;
    const nextEncoded = encodeTrackingCookie(updatedTracking);

    if (previousEncoded !== nextEncoded) {
      encodedUpdatedTracking = nextEncoded;
    }
  }

  const applyTrackingCookie = (response: NextResponse) => {
    if (!encodedUpdatedTracking) {
      return response;
    }

    response.cookies.set(TRACKING_COOKIE_NAME, encodedUpdatedTracking, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 180
    });

    return response;
  };

  if (LOCALE_PREFIX_PATTERN.test(pathname)) {
    const response = intlMiddleware(req);
    const localeSegment = pathname.split('/')[1];

    if (localeSegment && isSupportedLocale(localeSegment) && req.cookies.get(LOCALE_COOKIE_NAME)?.value !== localeSegment) {
      response.cookies.set(LOCALE_COOKIE_NAME, localeSegment, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365
      });
    }

    return applyTrackingCookie(response);
  }

  const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const localeFromCookie = cookieLocale && isSupportedLocale(cookieLocale) ? cookieLocale : undefined;
  const locale: Locale =
    localeFromCookie ??
    mapLanguageToLocale(req.headers.get('accept-language'));

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const originalSearchParams = req.nextUrl.searchParams;

  if (originalSearchParams.size > 0) {
    const cleaned = new URLSearchParams(originalSearchParams);
    let removed = false;

    for (const key of Array.from(cleaned.keys())) {
      if (
        key.startsWith('utm_') ||
        key === 'ref' ||
        key === 'salonId' ||
        key === 'influencerId' ||
        key === 'channel' ||
        key.startsWith('mt_')
      ) {
        cleaned.delete(key);
        removed = true;
      }
    }

    url.search = removed ? cleaned.toString() : search;
  } else {
    url.search = search;
  }

  const response = NextResponse.redirect(url, 307);

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  });

  return applyTrackingCookie(response);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
