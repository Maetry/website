"use client";

export type BookingAdaptivePlatform =
  | "android"
  | "ios"
  | "web-android"
  | "web-ios";

export type BookingPlatformVariant = "android" | "ios";

function getRuntimePlatformOS() {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const runtimePlatform = (globalThis as { Platform?: { OS?: unknown } }).Platform;
  return typeof runtimePlatform?.OS === "string" ? runtimePlatform.OS : null;
}

export function detectBookingAdaptivePlatform(): BookingAdaptivePlatform {
  const runtimeOS = getRuntimePlatformOS();

  if (runtimeOS === "ios") {
    return "ios";
  }

  if (runtimeOS === "android") {
    return "android";
  }

  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod|ios/.test(userAgent)) {
      return "web-ios";
    }

    if (/android/.test(userAgent)) {
      return "web-android";
    }
  }

  return "web-ios";
}

export function getBookingPlatformVariant(
  platform: BookingAdaptivePlatform,
): BookingPlatformVariant {
  return platform === "android" || platform === "web-android"
    ? "android"
    : "ios";
}

export function getBookingThemeName(platform: BookingAdaptivePlatform) {
  switch (platform) {
    case "android":
      return "booking_android";
    case "ios":
      return "booking_ios";
    case "web-android":
      return "booking_web_android";
    case "web-ios":
    default:
      return "booking_web_ios";
  }
}
