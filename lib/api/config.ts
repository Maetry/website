// Конфигурация API

export function resolveApiUrl(): string {
  const direct = process.env.API_URL;

  if (!direct) {
    throw new Error("API_URL is not configured");
  }

  return direct.replace(/\/+$/, "");
}

