// Consulta achievements por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Achievement } from '../types';

export async function getAchievements(): Promise<Achievement[]> {
  return postJson<Achievement[]>('/achievements', {});
}
