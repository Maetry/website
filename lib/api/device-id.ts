const DEVICE_ID_STORAGE_KEY = "maetry-device-id";

export function getOrCreateDeviceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const nextDeviceId = window.crypto?.randomUUID?.() ?? null;
    if (!nextDeviceId) {
      return null;
    }

    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId);
    return nextDeviceId;
  } catch {
    return null;
  }
}
