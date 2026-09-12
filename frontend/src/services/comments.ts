// Consulta comments por POST y conserva el contrato de respuesta del backend.
import { postJson } from './api';
import type { Comment } from '../types';

export async function getComments(): Promise<Comment[]> {
  return postJson<Comment[]>('/comments/list', {});
}

export async function createComment({
  name,
  message,
}: {
  name: string;
  message: string;
}): Promise<Comment> {
  return postJson<Comment>('/comments/create', { name, message });
}
