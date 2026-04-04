// API environment resolution.

const API_LOCAL_URL = "http://localhost:8080";
const API_STAGE_URL = "https://api-dev-601862402938.us-west2.run.app";
const API_PRODUCTION_URL = "https://api-app-601862402938.us-west2.run.app";

type ApiTarget = "local" | "production" | "stage";

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeTarget(value?: string): ApiTarget | null {
  switch (value?.trim().toLowerCase()) {
    case "local":
      return "local";
    case "stage":
      return "stage";
    case "prod":
    case "production":
      return "production";
    default:
      return null;
  }
}

export function resolveApiUrl(): string {
  const direct = process.env.API_URL?.trim();
  const target = normalizeTarget(process.env.API_TARGET);

  // Explicit target wins over developer-local .env overrides.
  switch (target) {
    case "local":
      return API_LOCAL_URL;
    case "stage":
      return API_STAGE_URL;
    case "production":
      return API_PRODUCTION_URL;
    default:
      break;
  }

  if (direct) {
    return normalizeUrl(direct);
  }

  return API_STAGE_URL;
}

/** Как выбран базовый URL для индикатора и отладки (без повторной логики resolve). */
export type ApiConnectionMode =
  | "customUrl"
  | "defaultStage"
  | "local"
  | "production"
  | "stage";

export type ApiConnectionDescriptor = {
  baseUrl: string;
  mode: ApiConnectionMode;
};

export function getApiConnectionDescriptor(): ApiConnectionDescriptor {
  const direct = process.env.API_URL?.trim();
  const target = normalizeTarget(process.env.API_TARGET);
  const baseUrl = resolveApiUrl();

  if (target) {
    return { mode: target, baseUrl };
  }
  if (direct) {
    return { mode: "customUrl", baseUrl };
  }
  return { mode: "defaultStage", baseUrl };
}
