"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Minimize2, Server } from "lucide-react";

import type { ApiConnectionDescriptor } from "@/lib/api/config";

import {
  getApiRequestLogServerSnapshot,
  getApiRequestLogSnapshot,
  installClientFetchDebugInterceptor,
  subscribeApiRequestLog,
} from "./apiRequestLog";

const STORAGE_KEY = "maetry_api_indicator_minimized";

const modeLabels: Record<ApiConnectionDescriptor["mode"], string> = {
  customUrl: "По API_URL",
  defaultStage: "Stage (fallback)",
  local: "Локально",
  production: "Production",
  stage: "Stage",
};

const modeBorder: Record<ApiConnectionDescriptor["mode"], string> = {
  customUrl: "border-sky-400/55",
  defaultStage: "border-zinc-500/55",
  local: "border-emerald-400/55",
  production: "border-rose-500/65",
  stage: "border-amber-400/55",
};

export function ApiEnvBanner({ descriptor }: { descriptor: ApiConnectionDescriptor }) {
  const { baseUrl, mode } = descriptor;
  const [minimized, setMinimized] = useState(false);

  const apiRequests = useSyncExternalStore(
    subscribeApiRequestLog,
    getApiRequestLogSnapshot,
    getApiRequestLogServerSnapshot,
  );

  useEffect(() => {
    return installClientFetchDebugInterceptor();
  }, []);

  useEffect(() => {
    try {
      setMinimized(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const setMinimizedPersist = (next: boolean) => {
    setMinimized(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  const tooltip = `Maetry API — ${modeLabels[mode]}\n${baseUrl}`;
  const border = modeBorder[mode];

  if (minimized) {
    return (
      <button
        type="button"
        className={`pointer-events-auto fixed bottom-4 left-4 z-[2147483647] flex h-11 w-11 items-center justify-center rounded-full border-2 ${border} bg-zinc-950/92 text-zinc-200 shadow-lg backdrop-blur-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/80`}
        title={tooltip}
        aria-label={`Развернуть индикатор API: ${modeLabels[mode]}, ${baseUrl}`}
        onClick={() => setMinimizedPersist(false)}
      >
        <Server className="h-5 w-5 shrink-0" aria-hidden />
      </button>
    );
  }

  return (
    <div
      className={`pointer-events-auto fixed bottom-4 left-4 z-[2147483647] max-w-[min(100vw-2rem,30rem)] rounded-lg border-2 ${border} bg-zinc-950/92 pl-3 pr-2 pb-2 pt-2 text-left font-sans text-xs text-zinc-100 shadow-lg backdrop-blur-sm`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="font-semibold tracking-tight text-zinc-200">Maetry API</div>
          <div className="mt-0.5 text-[11px] text-zinc-400">
            Режим:{" "}
            <span className="text-zinc-100">{modeLabels[mode]}</span>
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/80"
          title="Свернуть"
          aria-label="Свернуть индикатор API"
          onClick={() => setMinimizedPersist(true)}
        >
          <Minimize2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div
        className="mt-1 break-all font-mono text-[10px] leading-snug text-emerald-400"
        title={baseUrl}
      >
        Запросы с сервера и через{" "}
        <code className="rounded bg-zinc-800/80 px-0.5 text-zinc-400">/api/*</code>
        {" → "}
        {baseUrl}
      </div>

      <div className="mt-2 border-t border-zinc-700/60 pt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Запросы в этом окне (клиент)
        </div>
        {apiRequests.length === 0 ? (
          <div className="mt-1 text-[10px] text-zinc-500">
            Пока не было вызовов <code className="text-zinc-400">fetch</code> к{" "}
            <code className="rounded bg-zinc-800/80 px-0.5 text-zinc-400">/api/*</code>
          </div>
        ) : (
          <ul
            className="mt-1 max-h-[7.5rem] space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 font-mono text-[10px] leading-tight"
            aria-label="Недавние запросы к API маршрутам"
          >
            {apiRequests.map((row) => (
              <li
                key={row.id}
                className="flex gap-1.5 text-zinc-300"
                title={`${row.method} ${row.fullPath}`}
              >
                <span className="w-9 shrink-0 text-zinc-500">{row.method}</span>
                <span className="min-w-0 flex-1 whitespace-nowrap text-emerald-400">
                  {row.displayPath}
                </span>
                <span
                  className={
                    row.status === "pending"
                      ? "shrink-0 text-amber-300/90"
                      : row.status === "error"
                        ? "shrink-0 text-rose-400"
                        : row.status >= 500
                          ? "shrink-0 text-rose-400"
                          : row.status >= 400
                            ? "shrink-0 text-amber-300"
                            : "shrink-0 text-emerald-400/90"
                  }
                >
                  {row.status === "pending"
                    ? "…"
                    : row.status === "error"
                      ? "×"
                      : row.status}
                  {row.durationMs != null ? (
                    <span className="ml-1 text-zinc-500">{row.durationMs}ms</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
