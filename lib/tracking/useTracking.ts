'use client';

import { useEffect, useState } from 'react';

import type { PublicTracking } from './utm';

export type { PublicTracking } from './utm';

export function useTracking(): PublicTracking | null {
  const [data, setData] = useState<PublicTracking | null>(null);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/tracking', { credentials: 'include' });

        if (!res.ok) {
          return;
        }

        const json: PublicTracking = await res.json();

        if (!isCancelled) {
          setData(json);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return data;
}

