export type PlatformType = "ios" | "android" | "web";

const extractUserAgent = (source?: string): string => {
  if (source) {
    return source;
  }

  if (typeof navigator !== "undefined") {
    return navigator.userAgent;
  }

  return "";
};

export function detectPlatform(userAgent?: string): PlatformType {
  const ua = extractUserAgent(userAgent).toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  if (/android/.test(ua)) {
    return "android";
  }

  return "web";
}

