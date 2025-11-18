export type PlatformKey = "ios" | "android" | "desktop";

export type PlatformInfo = {
  userAgent: string;
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  platform: PlatformKey;
};

const extractUserAgent = (source?: string): string => {
  if (source) {
    return source;
  }

  if (typeof navigator !== "undefined") {
    return navigator.userAgent;
  }

  return "";
};

export function detectPlatform(userAgent?: string): PlatformInfo {
  const ua = extractUserAgent(userAgent);
  const lowerUa = ua.toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(lowerUa);
  const isAndroid = /android/.test(lowerUa);
  const isMacOS = !isIOS && /macintosh|mac os/.test(lowerUa);
  const isMobile = isIOS || isAndroid;
  const isDesktop = !isMobile;

  const platform: PlatformKey = isIOS ? "ios" : isAndroid ? "android" : "desktop";

  return {
    userAgent: ua,
    isIOS,
    isAndroid,
    isMacOS,
    isDesktop,
    isMobile,
    platform,
  };
}

