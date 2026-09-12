// Consulta auth y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';
import {
  comparePassword,
  signToken,
  verifyToken,
  sanitizeUser,
  setAuthCookie,
  clearAuthCookie,
  COOKIE_NAME,
} from '../utils/auth.js';
import { isValidEmail } from '../utils/validation.js';

// Autentica exclusivamente cuentas administrativas existentes.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const errors = {};

    if (!email || typeof email !== 'string') {
      errors.email = 'email is required and must be a string';
    } else if (!isValidEmail(email)) {
      errors.email = 'email format is invalid';
    }

    if (!password || typeof password !== 'string') {
      errors.password = 'password is required';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1 AND role = \'admin\'',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const row = result.rows[0];
    const valid = await comparePassword(password, row.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = sanitizeUser(row);
    const token = signToken({ userId: user.id, role: user.role });
    setAuthCookie(res, token);

    res.json({ user });
  } catch (err) {
    console.error('[auth]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
};

export const me = async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const result = await pool.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1 AND role = \'admin\'',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    console.error('[auth]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
