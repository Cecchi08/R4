// Comparte únicamente la sesión administrativa dentro del módulo admin.
import { createContext, useContext } from 'react';
import type { Admin } from '../types';
interface AuthContextValue {
  user: Admin | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ ok: true; user: Admin } | { ok: false; error: string; fieldErrors?: Record<string, string> }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
