// Простые функции валидации параметров API

import { ApiError } from "./error-handler";

export function validateId(id: string | undefined, paramName: string): string {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new ApiError(400, `Invalid ${paramName}: must be a non-empty string`);
  }
  
  // Базовая проверка на разумную длину (предотвращает слишком длинные строки)
  if (id.length > 200) {
    throw new ApiError(400, `Invalid ${paramName}: too long (max 200 characters)`);
  }
  
  return id.trim();
}

