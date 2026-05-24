'use client';
import { useEffect, useRef, useState } from 'react';

interface SSEState<T> {
  data: T | null;
  connected: boolean;
  error: boolean;
}

export function useSSE<T>(url: string): SSEState<T> {
  const [state, setState] = useState<SSEState<T>>({
    data: null,
    connected: false,
    error: false,
  });
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        if (!cancelled) setState((s) => ({ ...s, connected: true, error: false }));
      };

      es.onmessage = (event: MessageEvent) => {
        if (cancelled) return;
        try {
          const parsed = JSON.parse(event.data as string) as T;
          setState((s) => ({ ...s, data: parsed, connected: true, error: false }));
        } catch {
          /* ignore malformed frame */
        }
      };

      es.onerror = () => {
        es.close();
        if (!cancelled) {
          setState((s) => ({ ...s, connected: false, error: true }));
          // Back-off reconnect: 3 s
          retryRef.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      if (esRef.current) esRef.current.close();
    };
  }, [url]);

  return state;
}
