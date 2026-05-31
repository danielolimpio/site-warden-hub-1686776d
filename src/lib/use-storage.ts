import { useCallback, useEffect, useRef, useState } from "react";

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (v: T | ((p: T) => T)) => void] {
  // Lazy init: read from localStorage on the very first render (client only),
  // so we never momentarily hold `initial` and then overwrite the saved value.
  const [value, setValue] = useState<T>(() => readLS(key, initial));
  const keyRef = useRef(key);

  // If the key changes, re-read for the new key.
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      setValue(readLS(key, initial));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // On the client, if SSR rendered with `initial` (because window was undefined),
  // hydrate from localStorage once after mount.
  useEffect(() => {
    const stored = readLS<T | undefined>(key, undefined as unknown as T);
    if (stored !== undefined) setValue(stored);
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next));
          }
        } catch {}
        return next;
      });
    },
    [key],
  );

  return [value, set];
}