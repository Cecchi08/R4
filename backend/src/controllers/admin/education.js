// Valida y persiste education utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import { requireString, parseIntField } from '../../utils/validation.js';

// Valida únicamente los campos editables de education; el ID sólo selecciona el registro.
function parseBody(body) {
  const errors = {}, data = {};

  for (const [field, max] of [['institution',160],['title',200]]) {
    const error = requireString(body[field], field, 1, max);
    if (error) errors[field] = error; else data[field] = body[field].trim();
  }
  for (const field of ['start_year','end_year']) {
    const parsed = parseIntField(body[field], field, { min: 1900, max: field === 'start_year' ? 2100 : 2147483647, required: field === 'start_year' });
    if (parsed.error) errors[field] = parsed.error; else data[field] = parsed.value;
  }
  if (data.end_year !== null && data.end_year < data.start_year) errors.end_year = 'end_year must be on or after start_year';
  data.status = body.status ?? 'En curso';
  if (!['En curso','Finalizado','Pendiente'].includes(data.status)) errors.status = 'Invalid education status';

  return { errors, data };
}

export const listEducation = async (_req, res) => {
  try { res.json((await pool.query('SELECT * FROM education ORDER BY education_id ASC')).rows); }
  catch (err) { console.error('[admin/education]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
};

// Las consultas parametrizadas mantienen los valores separados de los identificadores SQL.
export const createEducation = async (req, res) => {
  const { errors, data } = parseBody(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const result = await pool.query('INSERT INTO education (institution, title, start_year, end_year, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [data.institution, data.title, data.start_year, data.end_year, data.status]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/education]', err.message);
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Record already exists' : 'Database operation failed' });
  }
};

export const updateEducation = async (req, res) => {
  const { errors, data } = parseBody(req.body || {});
  const id = Number(req.body?.education_id);
  if (!Number.isSafeInteger(id) || id < 1) errors.education_id = 'A positive ID is required';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const result = await pool.query('UPDATE education SET institution = $2, title = $3, start_year = $4, end_year = $5, status = $6 WHERE education_id = $1 RETURNING *', [id, data.institution, data.title, data.start_year, data.end_year, data.status]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/education]', err.message);
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Record already exists' : 'Database operation failed' });
  }
};

export const deleteEducation = async (req, res) => {
  const id = Number(req.body?.education_id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'A positive ID is required' });
  try {
    const result = await pool.query('DELETE FROM education WHERE education_id = $1 RETURNING education_id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ deleted: true, education_id: id });
  } catch (err) { console.error('[admin/education]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
};
