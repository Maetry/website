import { cookies, headers } from 'next/headers';

import {
  TRACKING_COOKIE_NAME,
  decodeTrackingCookie,
  type TrackingCookie
} from './utm';

export function getTrackingFromCookies(): TrackingCookie | null {
  const cookieStore = cookies();
  const raw = cookieStore.get(TRACKING_COOKIE_NAME)?.value;
  return decodeTrackingCookie(raw ?? null);
}

export function getTrackingFromRequestHeaders(): TrackingCookie | null {
  const requestHeaders = headers();
  const raw = requestHeaders.get(`cookie`);

  if (!raw) {
    return null;
  }

  const cookiesMap = raw
    .split(';')
    .map((pair) => pair.trim())
    .reduce<Record<string, string>>((acc, pair) => {
      const [key, ...rest] = pair.split('=');
      if (key) {
        acc[key] = rest.join('=');
      }
      return acc;
    }, {});

  return decodeTrackingCookie(cookiesMap[TRACKING_COOKIE_NAME] ?? null);
}

