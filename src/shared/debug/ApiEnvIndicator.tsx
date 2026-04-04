import { getApiConnectionDescriptor } from "@/lib/api/config";

import { ApiEnvBanner } from "./ApiEnvBanner";

function shouldShowApiEnvIndicator(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.SHOW_API_ENV_INDICATOR === "true"
  );
}

/** Плашка поверх UI: активный API и базовый URL бэкенда для SSR и API routes. */
export function ApiEnvIndicator() {
  if (!shouldShowApiEnvIndicator()) {
    return null;
  }

  const descriptor = getApiConnectionDescriptor();
  return <ApiEnvBanner descriptor={descriptor} />;
}
