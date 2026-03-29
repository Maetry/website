const DEVICE_ID_STORAGE_KEY = "maetry-device-id";
let inMemoryDeviceId: string | null = null;

function createRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

function createUuidFallback(): string {
  const bytes = createRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function generateDeviceId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return createUuidFallback();
}

export function getOrCreateDeviceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (inMemoryDeviceId) {
    return inMemoryDeviceId;
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) {
      inMemoryDeviceId = existing;
      return existing;
    }
  } catch {
    // Continue with in-memory generation when storage is unavailable.
  }

  const nextDeviceId = generateDeviceId();
  inMemoryDeviceId = nextDeviceId;

  try {
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId);
  } catch {
    // Ignore storage write failures and keep the in-memory identifier.
  }

  return nextDeviceId;
}
