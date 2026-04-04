import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";

import {
  setMonitoringContext,
  setMonitoringUser,
  trackEvent,
} from "@/lib/monitoring";
import { getOrCreateRequestId } from "@/lib/monitoring/server";

import { resolveApiUrl } from "./config";
import { ApiError } from "./error-handler";
import { devError } from "./utils";

interface ProxyRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  request: NextRequest;
  body?: unknown;
  headers?: Record<string, string>;
  errorCode: string;
  cache?: RequestCache;
  operation?: string;
}

function deriveOperationName(method: string, path: string): string {
  return `${path}_${method}`
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export async function proxyApiRequest({
  method,
  path,
  request,
  body,
  headers = {},
  errorCode,
  cache = "no-store",
  operation,
}: ProxyRequestOptions): Promise<NextResponse> {
  const requestId = getOrCreateRequestId(request);
  const operationName = operation ?? deriveOperationName(method, path);

  try {
    const apiUrl = resolveApiUrl();
    const targetUrl = `${apiUrl}${path}`;
    const authorization = request.headers.get("authorization");
    const deviceId = request.headers.get("device-id") ?? request.headers.get("Device-ID");
    const idempotencyKey =
      request.headers.get("idempotency-key") ?? request.headers.get("Idempotency-Key");

    const defaultHeaders: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": request.headers.get("user-agent") ?? "",
      "X-Request-ID": requestId,
      ...headers,
    };

    if (deviceId) {
      setMonitoringUser({ id: deviceId });
    }

    setMonitoringContext("api_proxy", {
      error_code: errorCode,
      method,
      path,
      request_id: requestId,
      target_url: targetUrl,
    });
    trackEvent(`${operationName}_started`, {
      request_id: requestId,
    });

    if (authorization) {
      defaultHeaders.Authorization = authorization;
    }

    if (deviceId) {
      defaultHeaders["Device-ID"] = deviceId;
    }

    if (idempotencyKey && !defaultHeaders["Idempotency-Key"]) {
      defaultHeaders["Idempotency-Key"] = idempotencyKey;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: defaultHeaders,
      cache,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
      if (!defaultHeaders["Content-Type"]) {
        defaultHeaders["Content-Type"] = "application/json";
      }
    }

    const proxyResponse = await fetch(targetUrl, fetchOptions);
    const text = await proxyResponse.text();

    // Обработка ошибок от прокси
    if (!proxyResponse.ok) {
      trackEvent(`${operationName}_failed`, {
        request_id: requestId,
        status: proxyResponse.status,
      });
      try {
        const errorData = JSON.parse(text);
        const response = NextResponse.json(
          {
            error: errorData.error || errorCode,
            message: errorData.message || proxyResponse.statusText,
          },
          {
            status: proxyResponse.status,
          },
        );
        response.headers.set("X-Request-ID", requestId);
        return response;
      } catch {
        const response = NextResponse.json(
          {
            error: errorCode,
            message: text || proxyResponse.statusText,
          },
          {
            status: proxyResponse.status,
          },
        );
        response.headers.set("X-Request-ID", requestId);
        return response;
      }
    }

    // Успешный ответ
    trackEvent(`${operationName}_success`, {
      request_id: requestId,
      status: proxyResponse.status,
    });
    const response = new NextResponse(text, {
      status: proxyResponse.status,
      headers: {
        "Content-Type": proxyResponse.headers.get("content-type") ?? "application/json",
        "X-Request-ID": requestId,
      },
    });
    return response;
  } catch (error) {
    Sentry.setContext("api_proxy_error", {
      error_code: errorCode,
      method,
      path,
      request_id: requestId,
    });
    trackEvent(`${operationName}_failed`, {
      request_id: requestId,
    });
    Sentry.captureException(error);
    devError(`[api-proxy] ${errorCode} failed:`, error);

    const response = NextResponse.json(
      {
        error: errorCode,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
    response.headers.set("X-Request-ID", requestId);
    return response;
  }
}

// Вспомогательная функция для обработки ошибок валидации в routes
export function handleValidationError(error: unknown, invalidIdError: string): NextResponse | null {
  if (error instanceof ApiError && error.status === 400) {
    return NextResponse.json(
      {
        error: invalidIdError,
        message: error.message,
      },
      { status: error.status },
    );
  }
  return null;
}
