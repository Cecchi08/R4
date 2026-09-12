// Carga el catálogo completo para conservar las categorías al filtrar en pantalla.
import { useState, useEffect, useCallback } from 'react';
import { getProjects } from '../services/projects.js';
import type { Project } from '../types/index.js';

export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getProjects().then(data => { if (active) { setProjects(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return {
    projects,
    loading,
    error,
    filterCategory,
    setFilterCategory,
    refresh,
  };
}
