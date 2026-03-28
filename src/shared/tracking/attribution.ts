'use client';

import type { PublicTracking } from '@/lib/tracking/utm';

export type BookingAttribution = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  ref: string | null;
};

export function extractAttribution(
  tracking: PublicTracking | null,
): BookingAttribution | null {
  if (!tracking) {
    return null;
  }

  const touch = tracking.lastTouch ?? tracking.firstTouch;
  if (!touch) {
    return null;
  }

  const hasData =
    touch.utm?.source || touch.utm?.medium || touch.utm?.campaign || touch.ref?.ref;

  if (!hasData) {
    return null;
  }

  return {
    source: touch.utm?.source ?? touch.ref?.ref ?? null,
    medium: touch.utm?.medium ?? null,
    campaign: touch.utm?.campaign ?? null,
    ref: touch.ref?.ref ?? null,
  };
}
