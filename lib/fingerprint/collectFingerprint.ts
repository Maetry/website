"use client";

export interface FingerprintPayload {
  language: string;
  languages: readonly string[];
  cores: number;
  memory: number;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  timeZone: string;
  platform?: string;
}

const isNavigator = typeof navigator !== "undefined";
const isWindow = typeof window !== "undefined";

const buildPayload = (): FingerprintPayload => {
  const defaultLanguage = isNavigator ? navigator.language : "en-US";
  const languages = isNavigator ? navigator.languages : [defaultLanguage];
  const hardwareConcurrency = isNavigator ? navigator.hardwareConcurrency ?? 0 : 0;
  const memory = isNavigator && "deviceMemory" in navigator ? Number((navigator as unknown as { deviceMemory: number }).deviceMemory) : 0;
  const screenWidth = isWindow ? window.screen.width : 0;
  const screenHeight = isWindow ? window.screen.height : 0;
  const colorDepth = isWindow ? window.screen.colorDepth : 0;
  const pixelRatio = isWindow ? window.devicePixelRatio : 1;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    language: defaultLanguage,
    languages,
    cores: hardwareConcurrency,
    memory,
    screenWidth,
    screenHeight,
    colorDepth,
    pixelRatio,
    timeZone,
    platform: isNavigator ? navigator.platform : undefined,
  };
};

export async function sendFingerprint(linkId: string): Promise<void> {
  if (!linkId || !isWindow) {
    return;
  }

  const payload = buildPayload();

  try {
    await fetch(`/api/fingerprint/${encodeURIComponent(linkId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to send fingerprint", error);
    }
  }
}

