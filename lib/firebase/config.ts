import { getAnalytics, type Analytics } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBPk5wpYvK15mCbVJW_8Q1TlV2MDtermBo',
  authDomain: 'maetry.firebaseapp.com',
  projectId: 'maetry',
  storageBucket: 'maetry.firebasestorage.app',
  messagingSenderId: '601862402938',
  appId: '1:601862402938:web:63595494b8ffbf51c51cc3',
  measurementId: 'G-6ZVL9JMM3B',
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

/**
 * Проверяет, нужно ли отправлять события в Firebase Analytics
 * Отключает трекинг в dev и local окружениях
 */
function shouldTrack(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Отключаем в dev режиме
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  // Отключаем на localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return false;
  }

  return true;
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAnalytics(): Analytics | null {
  if (!shouldTrack()) {
    return null;
  }

  if (!analytics) {
    try {
      const firebaseApp = getFirebaseApp();
      analytics = getAnalytics(firebaseApp);
    } catch (error) {
      console.error('Firebase Analytics initialization error:', error);
      return null;
    }
  }

  return analytics;
}

