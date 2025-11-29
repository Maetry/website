"use client";

import type { ClickRequest, MagicLinkResponse } from "./types";
import { clientApiRequest } from "./client";

const isNavigator = typeof navigator !== "undefined";
const isWindow = typeof window !== "undefined";

const buildClickRequest = (): ClickRequest => {
  const defaultLanguage = isNavigator ? navigator.language : "en-US";
  const language = defaultLanguage.split("-")[0] || "en";
  const languages = isNavigator ? navigator.languages.map((lang) => lang.split("-")[0]) : [language];
  const hardwareConcurrency = isNavigator ? navigator.hardwareConcurrency ?? 4 : 4;
  const memory = isNavigator && "deviceMemory" in navigator 
    ? Number((navigator as unknown as { deviceMemory: number }).deviceMemory) * 1024 
    : 4096; // MB
  const screenWidth = isWindow ? Math.round(screen.width * (window.devicePixelRatio || 1)) : 1920;
  const screenHeight = isWindow ? Math.round(screen.height * (window.devicePixelRatio || 1)) : 1080;
  const colorDepth = isWindow ? screen.colorDepth || 24 : 24;
  const pixelRatio = isWindow ? window.devicePixelRatio || 1.0 : 1.0;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    language,
    languages,
    cores: hardwareConcurrency,
    memory,
    screenWidth,
    screenHeight,
    colorDepth,
    pixelRatio,
    timeZone,
  };
};

export async function registerClick(nanoId: string): Promise<MagicLinkResponse> {
  if (!nanoId || !isWindow) {
    throw new Error("NanoId is required");
  }

  const clickRequest = buildClickRequest();
  return clientApiRequest<MagicLinkResponse>({
    endpoint: `/api/clicks/${encodeURIComponent(nanoId)}`,
    method: "POST",
    body: clickRequest,
  });
}

