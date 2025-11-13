export type UTM = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

export type RefMeta = {
  ref?: string;
  salonId?: string;
  influencerId?: string;
  channel?: string;
  extra?: Record<string, string>;
};

export type TrackingTouch = {
  utm?: UTM;
  ref?: RefMeta;
  ts: string;
  landingPath: string;
};

export type TrackingCookie = {
  firstTouch?: TrackingTouch;
  lastTouch?: TrackingTouch;
};

export const TRACKING_COOKIE_NAME = 'MT_TRACK';

export const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type UTMParamKey = (typeof UTM_PARAM_KEYS)[number];

export const REF_PARAM_KEYS = ['ref', 'salonId', 'influencerId', 'channel'] as const;

export type RefParamKey = (typeof REF_PARAM_KEYS)[number];

import type { NextRequest } from 'next/server';

export function extractUtmAndRefFromRequest(
  req: NextRequest,
): {
  utm?: UTM;
  ref?: RefMeta;
} {
  const url = req.nextUrl;
  const sp = url.searchParams;
  let utm: UTM | undefined;
  let ref: RefMeta | undefined;

  for (const key of UTM_PARAM_KEYS) {
    const value = sp.get(key);
    if (value) {
      if (!utm) utm = {};
      const normalizedKey = key.replace('utm_', '') as keyof UTM;
      utm[normalizedKey] = value;
    }
  }

  for (const key of REF_PARAM_KEYS) {
    const value = sp.get(key);
    if (value) {
      if (!ref) ref = { extra: {} };
      if (key === 'ref') ref.ref = value;
      else if (key === 'salonId') ref.salonId = value;
      else if (key === 'influencerId') ref.influencerId = value;
      else if (key === 'channel') ref.channel = value;
    }
  }

  for (const [key, value] of sp.entries()) {
    if (key.startsWith('mt_') && value) {
      if (!ref) ref = { extra: {} };
      if (!ref.extra) ref.extra = {};
      ref.extra[key] = value;
    }
  }

  return { utm, ref };
}

export function encodeTrackingCookie(data: TrackingCookie): string {
  const json = JSON.stringify(data);
  return Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeTrackingCookie(raw: string | undefined | null): TrackingCookie | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    return JSON.parse(json) as TrackingCookie;
  } catch {
    return null;
  }
}

export function updateTrackingCookie(
  existing: TrackingCookie | null,
  utm: UTM | undefined,
  ref: RefMeta | undefined,
  landingPath: string,
  nowIso: string,
): TrackingCookie {
  if (!utm && !ref) {
    return existing ?? {};
  }

  const touch: TrackingTouch = {
    utm,
    ref,
    ts: nowIso,
    landingPath,
  };

  if (!existing || !existing.firstTouch) {
    return {
      firstTouch: touch,
      lastTouch: touch,
    };
  }

  return {
    ...existing,
    lastTouch: touch,
  };
}

export type PublicTracking = {
  firstTouch?: {
    utm?: UTM;
    ref?: RefMeta;
  };
  lastTouch?: {
    utm?: UTM;
    ref?: RefMeta;
  };
};

