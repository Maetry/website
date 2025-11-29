// Утилиты для работы с API

export const isDev = process.env.NODE_ENV !== "production";

export function devLog(message: string, ...args: unknown[]): void {
  if (isDev) {
    console.log(message, ...args);
  }
}

export function devError(message: string, error: unknown): void {
  if (isDev) {
    console.error(message, error);
  }
}

