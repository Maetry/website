'use client';

import { logEvent, type EventParams } from 'firebase/analytics';

import { getFirebaseAnalytics } from './config';

/**
 * Логирует кастомное событие в Firebase Analytics
 * @param eventName - название события
 * @param eventParams - параметры события
 */
export function trackEvent(eventName: string, eventParams?: EventParams) {
  const analytics = getFirebaseAnalytics();
  if (!analytics) {
    return;
  }

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Firebase Analytics error:', error);
  }
}

/**
 * Логирует просмотр страницы
 * @param pagePath - путь страницы
 * @param pageTitle - заголовок страницы
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
}

