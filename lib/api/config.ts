// Конфигурация API

const API_DEV_URL = "https://api-dev-601862402938.us-west2.run.app";

export function resolveApiUrl(): string {
  const direct = process.env.API_URL;

  if (!direct) {
    return API_DEV_URL;
  }

  const normalized = direct.replace(/\/+$/, "");

  // Temporary safety rail: Website must keep using api-dev until the production API exists.
  if (
    normalized === "https://api.maetry.com" ||
    normalized === "https://api-app-601862402938.us-west2.run.app"
  ) {
    return API_DEV_URL;
  }

  return normalized;
}
