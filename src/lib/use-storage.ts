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

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Robust localStorage state hook.
 * - SSR-safe: always renders `initial` on the server and on the first client
 *   render to avoid hydration mismatches.
 * - Hydrates from localStorage on mount.
 * - Never writes back to storage until hydration is complete, so the saved
 *   value can't be clobbered by the initial render.
 * - Handles key changes (re-hydrates for the new key).
 * - Cross-tab sync via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const hydratedRef = useRef(false);
  const keyRef = useRef(key);

  // Hydrate on mount / when key changes.
  useEffect(() => {
    keyRef.current = key;
    hydratedRef.current = false;
    const stored = readLS<T | undefined>(key, undefined as unknown as T);
    if (stored !== undefined) setValue(stored);
    else setValue(initial);
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist whenever value changes (after hydration).
  useEffect(() => {
    if (!hydratedRef.current) return;
    writeLS(key, value);
  }, [key, value]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        // Write synchronously too so rapid unmounts don't lose data.
        if (hydratedRef.current) writeLS(key, next);
        return next;
      });
    },
    [key],
  );

  return [value, set];
}