"use client";

export type ApiRequestLogEntry = {
  id: string;
  method: string;
  /** Полный path + query для подсказки */
  fullPath: string;
  /** Укороченная строка с «…» в середине */
  displayPath: string;
  status: number | "pending" | "error";
  durationMs?: number;
  startedAt: number;
};

const MAX_ENTRIES = 14;

/** Одна ссылка для SSR/гидрации: иначе useSyncExternalStore зацикливается. */
export const API_REQUEST_LOG_SERVER_SNAPSHOT: ApiRequestLogEntry[] = [];

let entries: ApiRequestLogEntry[] = API_REQUEST_LOG_SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let patchDepth = 0;
let nativeFetch: typeof fetch | null = null;

function notify() {
  for (const l of listeners) {
    l();
  }
}

export function getApiRequestLogServerSnapshot(): ApiRequestLogEntry[] {
  return API_REQUEST_LOG_SERVER_SNAPSHOT;
}

function shouldLogFetchUrl(resolvedHref: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const u = new URL(resolvedHref, window.location.origin);
    if (u.origin !== window.location.origin) {
      return false;
    }
    return u.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function resolveMethod(input: RequestInfo | URL, init?: RequestInit): string {
  const fromInit = init?.method?.toUpperCase();
  if (fromInit) {
    return fromInit;
  }
  if (typeof input === "object" && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return "GET";
}

function pathFromResolvedHref(resolvedHref: string): string {
  try {
    const u = new URL(resolvedHref, window.location.origin);
    return `${u.pathname}${u.search || ""}`;
  } catch {
    return resolvedHref;
  }
}

/** Обрезка с многоточием в центре (видны начало и конец пути). */
function truncateMiddle(text: string, maxLen: number): string {
  const omission = "…";
  if (text.length <= maxLen) {
    return text;
  }
  if (maxLen <= omission.length + 1) {
    return text.slice(0, maxLen);
  }
  const core = maxLen - omission.length;
  const left = Math.ceil(core / 2);
  const right = Math.floor(core / 2);
  return `${text.slice(0, left)}${omission}${text.slice(text.length - right)}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getApiRequestLogSnapshot(): ApiRequestLogEntry[] {
  return entries;
}

export function subscribeApiRequestLog(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function recordStart(
  id: string,
  method: string,
  fullPath: string,
  displayPath: string,
) {
  const row: ApiRequestLogEntry = {
    id,
    method,
    fullPath,
    displayPath,
    status: "pending",
    startedAt: Date.now(),
  };
  entries = [row, ...entries].slice(0, MAX_ENTRIES);
  notify();
}

function recordFinish(id: string, status: number | "error") {
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) {
    return;
  }
  const durationMs = Date.now() - entries[idx].startedAt;
  entries = entries.map((e, i) =>
    i === idx ? { ...e, status, durationMs } : e,
  );
  notify();
}

/** Подмена window.fetch: пишет в лог вызовы к same-origin `/api/*`. */
export function installClientFetchDebugInterceptor(): () => void {
  if (typeof window === "undefined") {
    return () => {
      /* SSR: перехватчик не устанавливается */
    };
  }

  if (patchDepth === 0) {
    nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const impl = nativeFetch;
      if (!impl) {
        throw new Error("Maetry API debug: fetch patch is not initialized");
      }
      const href = resolveRequestUrl(input);
      if (!shouldLogFetchUrl(href)) {
        return impl(input, init);
      }

      const id = newId();
      const method = resolveMethod(input, init);
      const fullPath = pathFromResolvedHref(href);
      const displayPath = truncateMiddle(fullPath, 56);
      recordStart(id, method, fullPath, displayPath);

      try {
        const response = await impl(input, init);
        recordFinish(id, response.status);
        return response;
      } catch (error) {
        recordFinish(id, "error");
        throw error;
      }
    };
  }

  patchDepth += 1;

  return () => {
    patchDepth -= 1;
    if (patchDepth <= 0) {
      patchDepth = 0;
      if (nativeFetch) {
        window.fetch = nativeFetch;
        nativeFetch = null;
      }
    }
  };
}
