// Consulta skills por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Skill } from '../types';

export async function getSkills(category?: string): Promise<Skill[]> {
  return postJson<Skill[]>('/skills', { category });
}
