import type { BookingPlatformVariant } from "./utils/platform";

/**
 * Единый радиус карточек и групп в букинг-UI (iOS — крупное скругление, как grouped content в HIG).
 * Только экраны букинга; маркетинговые страницы не используют.
 */
export const BOOKING_SURFACE_RADIUS = {
  android: 12,
  ios: 22,
} as const;

export function bookingSurfaceRadius(platform: BookingPlatformVariant): number {
  return platform === "ios" ? BOOKING_SURFACE_RADIUS.ios : BOOKING_SURFACE_RADIUS.android;
}
