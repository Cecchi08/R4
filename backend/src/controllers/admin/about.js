// Valida y persiste about utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import { requireString, sanitizeString } from '../../utils/validation.js';

function parseAboutBody(body, isUpdate = false) {
  const errors = {};
  const data = {};

  const fullNameErr = requireString(body.full_name, 'full_name', 1, 120);
  if (fullNameErr) {
    errors.full_name = fullNameErr;
  } else {
    data.full_name = body.full_name.trim();
  }

  data.title = sanitizeString(body.title, 160) ?? '';
  data.description = sanitizeString(body.description, 10000) ?? '';
  data.interests = sanitizeString(body.interests, 10000) ?? '';
  data.objectives = sanitizeString(body.objectives, 10000) ?? '';
  data.profile = sanitizeString(body.profile, 10000) ?? '';
  data.technologies = sanitizeString(body.technologies, 10000) ?? '';
  data.additional_interest = sanitizeString(body.additional_interest, 10000) ?? '';

  if (isUpdate) {
    const id = Number(body.about_id);
    if (!Number.isInteger(id) || id < 1) {
      errors.about_id = 'about_id is required and must be a positive integer';
    } else {
      data.about_id = id;
    }
  }

  return { errors, data };
}

export const listAbout = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about ORDER BY about_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/about]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createAbout = async (req, res) => {
  try {
    const { errors, data } = parseAboutBody(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `INSERT INTO about (full_name, title, description, interests, objectives, profile, technologies, additional_interest) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.full_name, data.title, data.description, data.interests, data.objectives, data.profile, data.technologies, data.additional_interest]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/about]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const { errors, data } = parseAboutBody(req.body || {}, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `UPDATE about SET full_name = $2, title = $3, description = $4, interests = $5, objectives = $6, profile = $7, technologies = $8, additional_interest = $9 WHERE about_id = $1 RETURNING *`,
      [data.about_id, data.full_name, data.title, data.description, data.interests, data.objectives, data.profile, data.technologies, data.additional_interest]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/about]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const deleteAbout = async (req, res) => {
  try {
    const aboutId = Number(req.body?.about_id);
    if (!Number.isInteger(aboutId) || aboutId < 1) {
      return res.status(400).json({ error: 'about_id is required and must be a positive integer' });
    }

    const result = await pool.query(
      'DELETE FROM about WHERE about_id = $1 RETURNING about_id',
      [aboutId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ deleted: true, about_id: aboutId });
  } catch (err) {
    console.error('[admin/about]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
