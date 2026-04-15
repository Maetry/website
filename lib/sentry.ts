export const buildConfiguration =
  process.env.NODE_ENV === "production" ? "release" : "debug";

export function withBuildConfigurationTag(
  sentry: Pick<typeof import("@sentry/nextjs"), "setTag">
) {
  sentry.setTag("build_configuration", buildConfiguration);
}
