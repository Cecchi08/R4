// Sincroniza el tema visual con la preferencia guardada o la del sistema.
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'portfolio-theme';
type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  let stored: string | null = null;
  try { stored = localStorage.getItem(STORAGE_KEY); }
  catch { /* Usa la preferencia del sistema cuando el almacenamiento está bloqueado. */ }
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return getStoredTheme();
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = (): Theme => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(STORAGE_KEY, next); }
    catch { /* Mantiene el cambio en memoria aunque no pueda persistirlo. */ }
    applyTheme(next);
    setThemeState(next);
    return next;
  };

  return {
    theme,
    toggleTheme,
  };
}
