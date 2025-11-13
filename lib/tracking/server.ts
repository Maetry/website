import { cookies, headers } from 'next/headers';

import {
  TRACKING_COOKIE_NAME,
  decodeTrackingCookie,
  type TrackingCookie
} from './utm';

export async function getTrackingFromCookies(): Promise<TrackingCookie | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TRACKING_COOKIE_NAME)?.value;
  return decodeTrackingCookie(raw ?? null);
}

export async function getTrackingFromRequestHeaders(): Promise<TrackingCookie | null> {
  const requestHeaders = await headers();
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

