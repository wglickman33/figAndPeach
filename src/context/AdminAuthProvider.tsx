import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchAdminSession, loginAdmin, logoutAdmin, type AdminSession } from "../lib/api";
import { AdminAuthContext } from "./adminAuthState";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AdminSession | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchAdminSession();
      setSession(next);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginAdmin(email, password);
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ loading, session, login, logout, refresh }),
    [loading, session, login, logout, refresh],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
