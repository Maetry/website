import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import {
  monitored,
  setMonitoringContext,
  setMonitoringUser,
  setRequestCorrelation,
  type MonitoringData,
} from "../monitoring";

type MonitoredRouteOptions = {
  input?: Record<string, unknown>;
  tags?: Record<string, string | undefined>;
};

function getDeviceId(request: NextRequest): string | undefined {
  return request.headers.get("device-id") ?? request.headers.get("Device-ID") ?? undefined;
}

export function getOrCreateRequestId(request: NextRequest): string {
  return (
    request.headers.get("x-request-id") ??
    request.headers.get("request-id") ??
    randomUUID()
  );
}

export async function monitoredRoute<T extends Response>(
  request: NextRequest,
  name: string,
  fn: (requestId: string) => Promise<T>,
  options: MonitoredRouteOptions = {},
): Promise<T> {
  const requestId = setRequestCorrelation(getOrCreateRequestId(request));
  const deviceId = getDeviceId(request);

  if (deviceId) {
    setMonitoringUser({ id: deviceId });
  }

  setMonitoringContext("request", {
    device_id: deviceId ?? null,
    method: request.method,
    path: request.nextUrl.pathname,
    request_id: requestId,
  });

  if (options.input) {
    setMonitoringContext(`${name}_input`, options.input);
  }

  const response = await monitored(
    name,
    () => fn(requestId),
    {
      data: {
        device_id: deviceId,
        path: request.nextUrl.pathname,
        request_id: requestId,
      } satisfies MonitoringData,
      op: "http.server",
      tags: {
        method: request.method,
        route: request.nextUrl.pathname,
        ...options.tags,
      },
    },
  );

  response.headers.set("X-Request-ID", requestId);

  return response;
}
