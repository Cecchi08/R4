// Consulta about por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { About } from '../types';

export async function getAbout(): Promise<About | null> {
  return postJson<About | null>('/about');
}
