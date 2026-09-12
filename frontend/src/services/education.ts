// Consulta education por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Education } from '../types';
export const getEducation = () => postJson<Education[]>('/education');
