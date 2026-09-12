// Valida entradas antes de construir consultas para devolver 400 en lugar de errores SQL.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'password must be at least 8 characters';
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'password must be at most 72 UTF-8 bytes';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'password must contain at least one letter and one number';
  }
  return null;
}

export function sanitizeString(value, maxLen) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.slice(0, maxLen);
}

export function requireString(value, field, minLen = 1, maxLen = 255) {
  if (typeof value !== 'string') {
    return `${field} is required and must be a string`;
  }
  const trimmed = value.trim();
  if (trimmed.length < minLen) {
    return `${field} must be at least ${minLen} characters`;
  }
  if (trimmed.length > maxLen) {
    return `${field} must be at most ${maxLen} characters`;
  }
  return null;
}

export function parseIntField(value, field, { min, max, required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    return required ? { error: `${field} is required` } : { value: null };
  }
  const num = Number(value);
  if (!Number.isInteger(num)) {
    return { error: `${field} must be an integer` };
  }
  if (min !== undefined && num < min) {
    return { error: `${field} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { error: `${field} must be at most ${max}` };
  }
  return { value: num };
}

export function parseStringArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    return null;
  }
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
