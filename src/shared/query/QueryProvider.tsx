"use client";

import { useMemo, type ReactNode } from "react";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

const PUBLIC_BOOKING_QUERY_KEY = "public-booking";
const QUERY_CACHE_BUSTER = "v1";
const QUERY_CACHE_KEY = "maetry-query-cache";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const persister = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return createSyncStoragePersister({
      key: QUERY_CACHE_KEY,
      storage: window.sessionStorage,
    });
  }, []);

  if (persister) {
    return (
      <PersistQueryClientProvider
        client={getQueryClient()}
        persistOptions={{
          buster: QUERY_CACHE_BUSTER,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              query.queryKey[0] === PUBLIC_BOOKING_QUERY_KEY &&
              defaultShouldDehydrateQuery(query) &&
              query.state.status === "success",
          },
          persister,
        }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
