// Consulta languages por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Language } from '../types';
export const getLanguages = () => postJson<Language[]>('/languages');
