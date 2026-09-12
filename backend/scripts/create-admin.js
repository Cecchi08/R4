import pool from '../src/db/index.js';
import { hashPassword } from '../src/utils/auth.js';
import { isValidEmail, requireString, validatePassword } from '../src/utils/validation.js';

// Aprovisionamiento local explícito: nunca se publica como endpoint ni cambia cuentas existentes.
try {
  const { ADMIN_EMAIL: email, ADMIN_USERNAME: username, ADMIN_PASSWORD: password } = process.env;
  if (!isValidEmail(email) || requireString(username, 'username', 2, 50)) throw new Error('Set a valid ADMIN_EMAIL and ADMIN_USERNAME');
  const error = validatePassword(password);
  if (error) throw new Error(error);
  const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email.trim().toLowerCase(), username.trim()]);
  if (existing.rows.length) throw new Error('Email or username already exists; no account was modified');
  const hash = await hashPassword(password);
  await pool.query("INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'admin')", [username.trim(), email.trim().toLowerCase(), hash]);
  console.log('Administrator created');
} catch (err) { console.error(err.code === '23505' ? 'Email or username already exists' : err.message); process.exitCode = 1; }
finally { delete process.env.ADMIN_PASSWORD; await pool.end(); }
