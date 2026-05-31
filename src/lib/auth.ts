import { useCallback, useEffect, useState } from "react";

const KEY = "auth.v1";
export const ADMIN_EMAIL = "canalbocarose@gmail.com";
export const ADMIN_PASSWORD = "Vale30Night80*";

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAuthed(window.localStorage.getItem(KEY) === "1");
    } catch {}
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      window.localStorage.setItem(KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setAuthed(false);
  }, []);

  return { authed, ready, login, logout };
}