// Centraliza las peticiones POST con cookies y conserva los errores de validación del backend.
// VITE_API_URL es el origen del backend; /api también admite el proxy local.
const backendUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
export const API_BASE = backendUrl.endsWith('/api') ? backendUrl : backendUrl + '/api';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function postJson<T = unknown>(
  path: string,
  body: unknown = {},
): Promise<T> {
  const response = await fetch(API_BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    const data = payload as { error?: string; errors?: Record<string, string> } | null;
    throw new ApiError(
      response.status,
      data?.error ?? `HTTP ${response.status} ${response.statusText}`,
      data?.errors,
    );
  }

  return payload as T;
}
