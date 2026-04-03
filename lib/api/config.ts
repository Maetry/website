// Конфигурация API

const API_LOCAL_URL = "http://localhost:8080";
const API_STAGE_URL = "https://api-dev-601862402938.us-west2.run.app";

export function resolveApiUrl(): string {
  const direct = process.env.API_URL;
  const target = process.env.API_TARGET?.trim().toLowerCase();

  if (!direct) {
    return target === "local" ? API_LOCAL_URL : API_STAGE_URL;
  }

  const normalized = direct.replace(/\/+$/, "");

  // Temporary safety rail: Website must keep using api-dev until the production API exists.
  if (
    normalized === "https://api.maetry.com" ||
    normalized === "https://api-app-601862402938.us-west2.run.app"
  ) {
    return API_STAGE_URL;
  }

  return normalized;
}
