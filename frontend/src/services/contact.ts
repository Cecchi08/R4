// Consulta contact por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Contact } from '../types';
// Un resultado null representa una tabla sin contacto publicado.
export const getContact = () => postJson<Contact | null>('/contact');
