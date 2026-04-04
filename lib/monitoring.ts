import * as Sentry from "@sentry/nextjs";

export type MonitoringPrimitive = string | number | boolean | null | undefined;
export type MonitoringData = Record<string, MonitoringPrimitive>;

type MonitoringUser = {
  id?: string | null;
  email?: string | null;
  username?: string | null;
};

type MonitoredOptions = {
  context?: Record<string, unknown>;
  data?: MonitoringData;
  op?: string;
  tags?: Record<string, string | undefined>;
};

function normalizeMonitoringData(
  data?: MonitoringData,
): Record<string, string | number | boolean | null> | undefined {
  if (!data) {
    return undefined;
  }

  const entries = Object.entries(data).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries) as Record<string, string | number | boolean | null>;
}

export function trackEvent(name: string, data?: MonitoringData) {
  Sentry.addBreadcrumb({
    category: "event",
    data: normalizeMonitoringData(data),
    level: "info",
    message: name,
  });
}

export function setMonitoringUser(user: MonitoringUser | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  const normalizedUser = Object.fromEntries(
    Object.entries(user).filter(([, value]) => typeof value === "string" && value.length > 0),
  );

  Sentry.setUser(Object.keys(normalizedUser).length > 0 ? normalizedUser : null);
}

export function setMonitoringContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}

export function setRequestCorrelation(requestId: string) {
  Sentry.setTag("request_id", requestId);
  return requestId;
}

export async function monitored<T>(
  name: string,
  fn: () => Promise<T>,
  options: MonitoredOptions = {},
): Promise<T> {
  const data = normalizeMonitoringData(options.data);

  if (options.tags) {
    Object.entries(options.tags).forEach(([key, value]) => {
      if (value) {
        Sentry.setTag(key, value);
      }
    });
  }

  if (options.context) {
    setMonitoringContext(name, options.context);
  }

  trackEvent(`${name}_started`, data);

  return Sentry.startSpan(
    {
      name,
      op: options.op ?? "function",
    },
    async () => {
      try {
        const result = await fn();
        trackEvent(`${name}_success`, data);
        return result;
      } catch (error) {
        trackEvent(`${name}_failed`, {
          ...options.data,
          error_name: error instanceof Error ? error.name : "unknown_error",
        });
        Sentry.captureException(error);
        throw error;
      }
    },
  );
}
