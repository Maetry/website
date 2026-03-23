"use client";

import { handleApiResponse } from "./error-handler";
import { devError } from "./utils";

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
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Accept": "application/json",
      ...headers,
    },
    cache,
    signal,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
    if (!headers["Content-Type"]) {
      (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
    }
  }

  try {
    const response = await fetch(endpoint, fetchOptions);
    return handleApiResponse<T>(response);
  } catch (error) {
    devError(`Failed to fetch ${endpoint}`, error);
    throw error;
  }
}
