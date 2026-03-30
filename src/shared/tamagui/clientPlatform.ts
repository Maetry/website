"use client";

export type ClientAdaptivePlatform =
  | "android"
  | "ios"
  | "web-android"
  | "web-ios";

export type ClientPlatformVariant = "android" | "ios";

function getRuntimePlatformOS() {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const runtimePlatform = (globalThis as { Platform?: { OS?: unknown } }).Platform;
  return typeof runtimePlatform?.OS === "string" ? runtimePlatform.OS : null;
}

export function detectClientAdaptivePlatform(): ClientAdaptivePlatform {
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

export function getClientPlatformVariant(
  platform: ClientAdaptivePlatform,
): ClientPlatformVariant {
  return platform === "android" || platform === "web-android"
    ? "android"
    : "ios";
}
