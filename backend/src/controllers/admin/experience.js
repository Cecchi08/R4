// Valida y persiste experience utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import {
  requireString,
  isValidDate,
  sanitizeString,
  parseIntField,
  parseStringArray,
} from '../../utils/validation.js';

function parseExperienceBody(body, isUpdate = false) {
  const errors = {};
  const data = {};

  const positionErr = requireString(body.position, 'position', 1, 120);
  if (positionErr) {
    errors.position = positionErr;
  } else {
    data.position = body.position.trim();
  }

  data.organization = sanitizeString(body.organization, 160) ?? '';

  const startErr = requireString(body.start_date, 'start_date', 1, 10);
  if (startErr) {
    errors.start_date = startErr;
  } else {
    data.start_date = body.start_date.trim();
  }

  if (body.end_date === null || body.end_date === undefined || body.end_date === '') {
    data.end_date = null;
  } else if (typeof body.end_date === 'string') {
    data.end_date = body.end_date.trim();
  } else {
    errors.end_date = 'end_date must be a string or null';
  }

  data.description = sanitizeString(body.description, 10000) ?? '';

  const technologies = parseStringArray(body.technologies);
  if (technologies === null) {
    errors.technologies = 'technologies must be an array of strings';
  } else {
    data.technologies = technologies;
  }

  const sortResult = parseIntField(body.sort_order ?? 0, 'sort_order', { min: 0 });
  if (sortResult.error) {
    errors.sort_order = sortResult.error;
  } else {
    data.sort_order = sortResult.value ?? 0;
  }

  if (isUpdate) {
    const id = Number(body.experience_id);
    if (!Number.isInteger(id) || id < 1) {
      errors.experience_id = 'experience_id is required and must be a positive integer';
    } else {
      data.experience_id = id;
    }
  }

  if (!isValidDate(data.start_date)) errors.start_date = 'start_date must be a valid YYYY-MM-DD date';
  if (data.end_date !== null && (!isValidDate(data.end_date) || data.end_date < data.start_date)) errors.end_date = 'end_date must be a valid date on or after start_date';
  data.status = body.status ?? 'En vigencia';
  if (!["En vigencia","Finalizada","Pendiente"].includes(data.status)) errors.status = 'Invalid status';
  return { errors, data };
}

export const listExperience = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM experience ORDER BY sort_order ASC, start_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/experience]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createExperience = async (req, res) => {
  try {
    const { errors, data } = parseExperienceBody(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `INSERT INTO experience (position, organization, start_date, end_date, description, technologies, sort_order, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.position,
        data.organization,
        data.start_date,
        data.end_date,
        data.description,
        data.technologies,
        data.sort_order,
        data.status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/experience]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { errors, data } = parseExperienceBody(req.body || {}, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `UPDATE experience SET
        position = $2,
        organization = $3,
        start_date = $4,
        end_date = $5,
        description = $6,
        technologies = $7,
        sort_order = $8,
        status = $9
       WHERE experience_id = $1
       RETURNING *`,
      [
        data.experience_id,
        data.position,
        data.organization,
        data.start_date,
        data.end_date,
        data.description,
        data.technologies,
        data.sort_order,
        data.status,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/experience]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const experienceId = Number(req.body?.experience_id);
    if (!Number.isInteger(experienceId) || experienceId < 1) {
      return res.status(400).json({ error: 'experience_id is required and must be a positive integer' });
    }

    const result = await pool.query(
      'DELETE FROM experience WHERE experience_id = $1 RETURNING experience_id',
      [experienceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ deleted: true, experience_id: experienceId });
  } catch (err) {
    console.error('[admin/experience]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
