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
    // Notify same-window listeners (the native `storage` event only fires
    // across tabs). Auto-sync uses this to push changes to the cloud.
    window.dispatchEvent(new CustomEvent("ls:write", { detail: { key } }));
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
  const valueRef = useRef(value);
  const hydratedRef = useRef(false);
  const keyRef = useRef(key);

  // Hydrate on mount / when key changes.
  useEffect(() => {
    keyRef.current = key;
    hydratedRef.current = false;
    const stored = readLS<T | undefined>(key, undefined as unknown as T);
    const next = stored !== undefined ? stored : initial;
    valueRef.current = next;
    setValue(next);
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist whenever value changes (after hydration).
  useEffect(() => {
    if (!hydratedRef.current) return;
    valueRef.current = value;
    writeLS(key, value);
  }, [key, value]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        const next = JSON.parse(e.newValue) as T;
        valueRef.current = next;
        setValue(next);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(valueRef.current) : v;
      valueRef.current = next;
      // Write synchronously so cloud sync/manual saves never read stale data.
      if (hydratedRef.current) writeLS(key, next);
      setValue(next);
    },
    [key],
  );

  return [value, set];
}