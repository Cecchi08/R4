// Valida y persiste languages utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import { requireString, parseIntField } from '../../utils/validation.js';

// Valida únicamente los campos editables de languages; el ID sólo selecciona el registro.
function parseBody(body) {
  const errors = {}, data = {};

  const error = requireString(body.name, 'name', 1, 80);
  if (error) errors.name = error; else data.name = body.name.trim();
  data.level = body.level;
  if (!['Nativo','C1','C2','B2','B1','A2','A1'].includes(data.level)) errors.level = 'Invalid language level';
  const parsed = parseIntField(body.sort_order ?? 0, 'sort_order', { min: 0, max: 2147483647 });
  if (parsed.error) errors.sort_order = parsed.error; else data.sort_order = parsed.value;

  return { errors, data };
}

export const listLanguages = async (_req, res) => {
  try { res.json((await pool.query('SELECT * FROM languages ORDER BY language_id ASC')).rows); }
  catch (err) { console.error('[admin/languages]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
};

// Las consultas parametrizadas mantienen los valores separados de los identificadores SQL.
export const createLanguages = async (req, res) => {
  const { errors, data } = parseBody(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const result = await pool.query('INSERT INTO languages (name, level, sort_order) VALUES ($1, $2, $3) RETURNING *', [data.name, data.level, data.sort_order]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/languages]', err.message);
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Record already exists' : 'Database operation failed' });
  }
};

export const updateLanguages = async (req, res) => {
  const { errors, data } = parseBody(req.body || {});
  const id = Number(req.body?.language_id);
  if (!Number.isSafeInteger(id) || id < 1) errors.language_id = 'A positive ID is required';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const result = await pool.query('UPDATE languages SET name = $2, level = $3, sort_order = $4 WHERE language_id = $1 RETURNING *', [id, data.name, data.level, data.sort_order]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/languages]', err.message);
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Record already exists' : 'Database operation failed' });
  }
};

export const deleteLanguages = async (req, res) => {
  const id = Number(req.body?.language_id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'A positive ID is required' });
  try {
    const result = await pool.query('DELETE FROM languages WHERE language_id = $1 RETURNING language_id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ deleted: true, language_id: id });
  } catch (err) { console.error('[admin/languages]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
};
