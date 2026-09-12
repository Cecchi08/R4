// Consulta experience por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Experience } from '../types';

export async function getExperience(): Promise<Experience[]> {
  return postJson<Experience[]>('/experience', {});
}
