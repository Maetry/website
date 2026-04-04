"use client";

import * as Sentry from "@sentry/nextjs";

import { getOrCreateDeviceId } from "./device-id";
import { handleApiResponse } from "./error-handler";
import { devError, isAbortError } from "./utils";

interface ClientApiRequestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export async function clientApiRequest<T>({
  endpoint,
  method = "GET",
  body,
  headers = {},
  signal,
  cache = "no-store",
}: ClientApiRequestOptions): Promise<T> {
  const deviceId = getOrCreateDeviceId();
  const requestHeaders = new Headers({
    Accept: "application/json",
    ...headers,
  });

  if (deviceId && !requestHeaders.has("Device-ID")) {
    requestHeaders.set("Device-ID", deviceId);
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
    signal,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  try {
    const response = await fetch(endpoint, fetchOptions);
    return handleApiResponse<T>(response);
  } catch (error) {
    if (!isAbortError(error)) {
      Sentry.setContext("client_api_request", {
        endpoint,
        method,
      });
      Sentry.captureException(error);
      devError(`Failed to fetch ${endpoint}`, error);
    }
    throw error;
  }
}
