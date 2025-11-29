import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
}

export async function proxyApiRequest({
  method,
  path,
  request,
  body,
  headers = {},
  errorCode,
  cache = "no-store",
}: ProxyRequestOptions): Promise<NextResponse> {
  try {
    const apiUrl = resolveApiUrl();
    const targetUrl = `${apiUrl}${path}`;

    const defaultHeaders: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": request.headers.get("user-agent") ?? "",
      ...headers,
    };

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
      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(
          {
            error: errorData.error || errorCode,
            message: errorData.message || proxyResponse.statusText,
          },
          {
            status: proxyResponse.status,
          },
        );
      } catch {
        return NextResponse.json(
          {
            error: errorCode,
            message: text || proxyResponse.statusText,
          },
          {
            status: proxyResponse.status,
          },
        );
      }
    }

    // Успешный ответ
    return new NextResponse(text, {
      status: proxyResponse.status,
      headers: {
        "Content-Type": proxyResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    devError(`[api-proxy] ${errorCode} failed:`, error);

    return NextResponse.json(
      {
        error: errorCode,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
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
