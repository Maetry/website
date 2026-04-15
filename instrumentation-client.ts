import * as Sentry from "@sentry/nextjs";
import { buildConfiguration, withBuildConfigurationTag } from "./lib/sentry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  initialScope: {
    tags: {
      build_configuration: buildConfiguration,
    },
  },
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [Sentry.replayIntegration()],
});

withBuildConfigurationTag(Sentry);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
