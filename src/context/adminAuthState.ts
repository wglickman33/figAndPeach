import { createContext } from "react";
import type { AdminSession } from "../lib/api";

export type AdminAuthContextValue = {
  loading: boolean;
  session: AdminSession | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
