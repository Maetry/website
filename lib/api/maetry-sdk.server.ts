import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createClient } from "@maetry/shared-sdk/client";

import { resolveApiUrl } from "./config";
import { ApiError } from "./error-handler";

type SharedApiErrorShape = {
  error?: string;
  message?: string;
  status?: number;
};

type MaetryClientOptions = {
  authorization?: string | null;
};

export const MAETRY_THROW_ON_ERROR_OPTIONS = {
  throwOnError: true as const,
};

export function unwrapMaetrySdkResult<T>(result: {
  data: T;
  request: Request;
  response: Response;
}): T {
  return result.data;
}

export function createMaetryServerClient(options: MaetryClientOptions = {}) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.authorization) {
    headers.set("Authorization", options.authorization);
  }

  return createClient({
    baseUrl: resolveApiUrl(),
    headers,
    ...MAETRY_THROW_ON_ERROR_OPTIONS,
  });
}

export function getAuthorizationHeader(request: NextRequest): string | null {
  return request.headers.get("authorization");
}

export function requireAuthorizationHeader(request: NextRequest): string {
  const authorization = getAuthorizationHeader(request);

  if (!authorization) {
    throw new ApiError(401, "Authorization header is required");
  }

  return authorization;
}

export function getDeviceIdHeader(request: NextRequest): string | null {
  return request.headers.get("device-id") ?? request.headers.get("Device-ID");
}

export function requireDeviceIdHeader(request: NextRequest): string {
  const deviceId = getDeviceIdHeader(request);

  if (!deviceId) {
    throw new ApiError(400, "Device-ID header is required");
  }

  return deviceId;
}

export function getIdempotencyKeyHeader(request: NextRequest): string {
  return (
    request.headers.get("idempotency-key") ??
    request.headers.get("Idempotency-Key") ??
    randomUUID()
  );
}

export function normalizeMaetrySdkError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === "string") {
    return new ApiError(500, error);
  }

  if (error && typeof error === "object") {
    const candidate = error as SharedApiErrorShape;

    return new ApiError(
      typeof candidate.status === "number" ? candidate.status : 500,
      candidate.message ?? candidate.error ?? "Maetry API request failed",
    );
  }

  return new ApiError(500, "Maetry API request failed");
}

export function maetrySdkErrorResponse(
  error: unknown,
  fallbackCode: string,
): NextResponse {
  const normalized = normalizeMaetrySdkError(error);

  return NextResponse.json(
    {
      error: fallbackCode,
      message: normalized.message,
    },
    {
      status: normalized.status,
    },
  );
}
