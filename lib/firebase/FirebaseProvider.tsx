'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logEvent } from 'firebase/analytics';

import { getFirebaseAnalytics } from './config';
import { useTracking } from '@/lib/tracking/useTracking';

/**
 * Компонент для автоматического трекинга страниц в Firebase Analytics
 * Инициализирует Firebase и логирует события при навигации
 */
export function FirebaseTracker() {
  const pathname = usePathname();
  const tracking = useTracking();

  useEffect(() => {
    const analytics = getFirebaseAnalytics();

    if (!analytics) {
      return;
    }

    // Firebase автоматически отслеживает UTM параметры из URL при загрузке страницы
    // Но для SPA нужно явно логировать page_view при навигации
    logEvent(analytics, 'page_view', {
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    });

    // Логируем кастомные параметры трекинга из cookies (Firebase их не отслеживает автоматически)
    if (tracking?.lastTouch) {
      const customParams: Record<string, string> = {
        page_path: pathname,
      };

      // Добавляем реферальные параметры
      if (tracking.lastTouch.ref) {
        const { ref, salonId, influencerId, channel, extra } = tracking.lastTouch.ref;
        if (ref) customParams.ref = ref;
        if (salonId) customParams.salon_id = salonId;
        if (influencerId) customParams.influencer_id = influencerId;
        if (channel) customParams.channel = channel;
        if (extra) {
          Object.entries(extra).forEach(([key, value]) => {
            customParams[`mt_${key}`] = value;
          });
        }
      }

      // Логируем first touch данные для атрибуции
      if (tracking.firstTouch) {
        if (tracking.firstTouch.utm) {
          const { source, medium, campaign } = tracking.firstTouch.utm;
          if (source) customParams.first_touch_source = source;
          if (medium) customParams.first_touch_medium = medium;
          if (campaign) customParams.first_touch_campaign = campaign;
        }
      }

      logEvent(analytics, 'custom_tracking', customParams);
    }
  }, [pathname, tracking]);

  return null;
}

