// Consulta projects por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Project } from '../types';

export async function getProjects(category?: string): Promise<Project[]> {
  return postJson<Project[]>('/projects', {
    category: category === 'all' || !category ? undefined : category,
  });
}
