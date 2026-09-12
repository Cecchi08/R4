// Consulta auth por POST y conserva el contrato de respuesta del backend.
import { ApiError, postJson } from './api';
import type { Admin } from '../types';

// Las cookies HttpOnly contienen la sesión; JavaScript sólo recibe el perfil admin.
export async function loginAdmin(data: { email: string; password: string }): Promise<Admin> {
  return (await postJson<{ user: Admin }>('/auth/login', data)).user;
}
export async function logoutAdmin(): Promise<void> { await postJson('/auth/logout'); }
export async function fetchAdmin(): Promise<Admin | null> {
  try { return (await postJson<{ user: Admin }>('/auth/me')).user; }
  catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
