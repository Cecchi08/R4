// Recupera la sesión admin y sincroniza login/logout sin afectar al portfolio público.
import { AuthContext } from './authContext';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError } from '../services/api';
import {
  fetchAdmin,
  loginAdmin,
  logoutAdmin,
} from '../services/auth';
import type { Admin } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setAdmin] = useState<Admin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAdmin().then((current) => {
      if (active) {
        setAdmin(current);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (active) { setError(err instanceof Error ? err.message : 'Error de sesión'); setLoading(false); }
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const loggedIn = await loginAdmin({ email, password });
      setAdmin(loggedIn);
      setError(null);
      return { ok: true as const, user: loggedIn };
    } catch (err) {
      if (err instanceof ApiError) {
        return {
          ok: false as const,
          error: err.message,
          fieldErrors: err.errors,
        };
      }
      return { ok: false as const, error: 'Server error. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
    }),
    [user, loading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

