// API environment resolution.

const API_LOCAL_URL = "http://localhost:8080";
const API_STAGE_URL = "https://api-dev-601862402938.us-west2.run.app";
const API_PRODUCTION_URL = "https://api-app-601862402938.us-west2.run.app";

type ApiTarget = "local" | "production" | "stage";

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
  const target = normalizeTarget(process.env.API_TARGET);
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  const isProductionDeployment =
    vercelEnv === "production" || (!vercelEnv && nodeEnv === "production");

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

  // Production deploys must always use the production API.
  if (isProductionDeployment) {
    return API_PRODUCTION_URL;
  }

  if (vercelEnv === "preview") {
    return API_STAGE_URL;
  }

  if (nodeEnv === "development") {
    return API_LOCAL_URL;
  }

  return API_PRODUCTION_URL;
}

/** Как выбран базовый URL для индикатора и отладки (без повторной логики resolve). */
export type ApiConnectionMode =
  | "defaultLocal"
  | "defaultPreviewStage"
  | "defaultProduction"
  | "local"
  | "production"
  | "stage";

export type ApiConnectionDescriptor = {
  baseUrl: string;
  mode: ApiConnectionMode;
};

export function getApiConnectionDescriptor(): ApiConnectionDescriptor {
  const target = normalizeTarget(process.env.API_TARGET);
  const baseUrl = resolveApiUrl();
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  const isProductionDeployment =
    vercelEnv === "production" || (!vercelEnv && nodeEnv === "production");

  if (target) {
    return { mode: target, baseUrl };
  }
  if (isProductionDeployment) {
    return { mode: "defaultProduction", baseUrl };
  }
  if (vercelEnv === "preview") {
    return { mode: "defaultPreviewStage", baseUrl };
  }
  if (nodeEnv === "development") {
    return { mode: "defaultLocal", baseUrl };
  }
  return { mode: "defaultProduction", baseUrl };
}
