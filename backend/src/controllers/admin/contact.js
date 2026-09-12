// Valida y persiste contact utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import { requireString, isValidEmail } from '../../utils/validation.js';

// Valida únicamente los campos editables de profile_contact; el ID sólo selecciona el registro.
function parseBody(body) {
  const errors = {}, data = {};

  for (const [field,max] of [['email',255],['phone',30],['github_url',2048],['linkedin_url',2048],['public_location',120]]) {
    const error = requireString(body[field], field, 1, max);
    if (error) errors[field] = error; else data[field] = body[field].trim();
  }
  if (!isValidEmail(data.email)) errors.email = 'Invalid email';
  for (const field of ['github_url','linkedin_url']) {
    try { if (!['https:','http:'].includes(new URL(data[field]).protocol)) errors[field] = 'Use an HTTP(S) URL'; }
    catch { errors[field] = 'Invalid URL'; }
  }

  return { errors, data };
}

export const listContact = async (_req, res) => {
  try { res.json((await pool.query('SELECT * FROM profile_contact ORDER BY contact_id ASC')).rows); }
  catch (err) { console.error('[admin/contact]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
};

// Las consultas parametrizadas mantienen los valores separados de los identificadores SQL.
export const createContact = async (req, res) => {
  const { errors, data } = parseBody(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const result = await pool.query('INSERT INTO profile_contact (email, phone, github_url, linkedin_url, public_location) VALUES ($1, $2, $3, $4, $5) RETURNING *', [data.email, data.phone, data.github_url, data.linkedin_url, data.public_location]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/contact]', err.message);
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Record already exists' : 'Database operation failed' });
  }
};

export const updateContact = async (req, res) => {
  const { errors, data } = parseBody(req.body || {});
  const id = Number(req.body?.contact_id);
  if (!Number.isSafeInteger(id) || id < 1) errors.contact_id = 'A positive ID is required';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const result = await pool.query('UPDATE profile_contact SET email = $2, phone = $3, github_url = $4, linkedin_url = $5, public_location = $6 WHERE contact_id = $1 RETURNING *', [id, data.email, data.phone, data.github_url, data.linkedin_url, data.public_location]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/contact]', err.message);
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Record already exists' : 'Database operation failed' });
  }
};

export const deleteContact = async (req, res) => {
  const id = Number(req.body?.contact_id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'A positive ID is required' });
  try {
    const result = await pool.query('DELETE FROM profile_contact WHERE contact_id = $1 RETURNING contact_id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ deleted: true, contact_id: id });
  } catch (err) { console.error('[admin/contact]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
};
