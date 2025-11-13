import { NextResponse } from 'next/server';

import { getTrackingFromCookies } from '@/lib/tracking/server';
import { type PublicTracking } from '@/lib/tracking/utm';

const EMPTY_RESPONSE: PublicTracking = {};

export async function GET() {
  const tracking = getTrackingFromCookies();

  if (!tracking) {
    return NextResponse.json(EMPTY_RESPONSE);
  }

  const { firstTouch, lastTouch } = tracking;

  const payload: PublicTracking = {
    firstTouch: firstTouch
      ? {
          utm: firstTouch.utm,
          ref: firstTouch.ref
        }
      : undefined,
    lastTouch: lastTouch
      ? {
          utm: lastTouch.utm,
          ref: lastTouch.ref
        }
      : undefined
  };

  return NextResponse.json(payload);
}

