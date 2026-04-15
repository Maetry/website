// API environment resolution.

const API_LOCAL_URL = "http://localhost:8080";
const API_STAGE_URL = "https://api-dev-601862402938.us-west2.run.app";
// Until a separate production API exists, production traffic uses the stage Cloud Run service.
const API_PRODUCTION_URL = API_STAGE_URL;

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
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

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

  if (vercelEnv === "production") {
    return API_PRODUCTION_URL;
  }

  if (!vercelEnv && process.env.NODE_ENV === "production") {
    return API_PRODUCTION_URL;
  }

  return API_STAGE_URL;
}

/** Как выбран базовый URL для индикатора и отладки (без повторной логики resolve). */
export type ApiConnectionMode =
  | "customUrl"
  | "defaultStage"
  | "defaultProduction"
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
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

  if (target) {
    return { mode: target, baseUrl };
  }
  if (direct) {
    return { mode: "customUrl", baseUrl };
  }
  if (vercelEnv === "production") {
    return { mode: "defaultProduction", baseUrl };
  }
  if (!vercelEnv && process.env.NODE_ENV === "production") {
    return { mode: "defaultProduction", baseUrl };
  }
  return { mode: "defaultStage", baseUrl };
}
