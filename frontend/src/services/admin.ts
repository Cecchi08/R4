// Construye las operaciones CRUD POST para las entidades administrativas permitidas.
import { postJson } from './api';

export type AdminEntity =
  | 'education'
  | 'languages'
  | 'contact'
  | 'about'
  | 'skills'
  | 'experience'
  | 'achievements'
  | 'projects'
  | 'comments';

const PATHS: Record<AdminEntity, string> = {
  education: '/admin/education',
  languages: '/admin/languages',
  contact: '/admin/contact',
  about: '/admin/about',
  skills: '/admin/skills',
  experience: '/admin/experience',
  achievements: '/admin/achievements',
  projects: '/admin/projects',
  comments: '/admin/comments',
};

export async function adminList<T>(entity: AdminEntity): Promise<T[]> {
  return postJson<T[]>(`${PATHS[entity]}/list`);
}

export async function adminCreate<T>(entity: AdminEntity, data: Record<string, unknown>): Promise<T> {
  return postJson<T>(`${PATHS[entity]}/create`, data);
}

export async function adminUpdate<T>(entity: AdminEntity, data: Record<string, unknown>): Promise<T> {
  return postJson<T>(`${PATHS[entity]}/update`, data);
}

export async function adminDelete(
  entity: AdminEntity,
  idField: string,
  id: number,
): Promise<void> {
  await postJson(`${PATHS[entity]}/delete`, { [idField]: id });
}

