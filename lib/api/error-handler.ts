// Общая утилита для обработки ошибок API

export class ApiError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? 'API request failed');
    this.name = 'ApiError';
    this.status = status;
    // Поддержка правильного наследования Error в TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

function readStringField(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

const GENERIC_HTTP_MESSAGES = new Set([
  "Bad Request",
  "Unauthorized",
  "Forbidden",
  "Not Found",
  "Internal Server Error",
]);

export async function extractErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const data = (await response.json()) as { message?: unknown; error?: unknown };
    const message = readStringField(data?.message);
    const code = readStringField(data?.error);

    if (code && message && code !== message && GENERIC_HTTP_MESSAGES.has(message)) {
      return code;
    }

    return message ?? code;
  } catch {
    return undefined;
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    
    if (response.status === 404) {
      throw new NotFoundError(message);
    }
    
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
