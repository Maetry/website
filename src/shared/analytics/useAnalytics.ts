'use client';

import { useCallback } from 'react';

import { trackEvent } from '@/lib/firebase/analytics';

export type AnalyticsEvent =
  | 'booking_started'
  | 'booking_service_selected'
  | 'booking_specialist_selected'
  | 'booking_time_selected'
  | 'booking_completed'
  | 'billing_page_viewed'
  | 'billing_plan_selected'
  | 'billing_checkout_started'
  | 'wallet_pass_added'
  | 'invite_page_viewed';

export function useAnalytics() {
  const track = useCallback(
    (event: AnalyticsEvent, params?: Record<string, string | number>) => {
      trackEvent(event, params);
    },
    [],
  );

  return { track };
}
