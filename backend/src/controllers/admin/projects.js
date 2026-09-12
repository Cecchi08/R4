// Valida y persiste projects utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import {
  requireString,
  isValidDate,
  sanitizeString,
  parseIntField,
  parseStringArray,
} from '../../utils/validation.js';

function parseProjectBody(body, isUpdate = false) {
  const errors = {};
  const data = {};

  const nameErr = requireString(body.name, 'name', 1, 160);
  if (nameErr) {
    errors.name = nameErr;
  } else {
    data.name = body.name.trim();
  }

  data.short_description = sanitizeString(body.short_description, 260) ?? '';
  data.full_description = sanitizeString(body.full_description, 10000) ?? '';
  data.category = sanitizeString(body.category, 60) ?? '';
  data.image_url = sanitizeString(body.image_url, 255);
  data.demo_url = sanitizeString(body.demo_url, 255);
  data.repo_url = sanitizeString(body.repo_url, 255);

  const technologies = parseStringArray(body.technologies);
  if (technologies === null) {
    errors.technologies = 'technologies must be an array of strings';
  } else {
    data.technologies = technologies;
  }

  if (body.project_date === null || body.project_date === undefined || body.project_date === '') {
    data.project_date = null;
  } else if (typeof body.project_date === 'string') {
    data.project_date = body.project_date.trim();
  } else {
    errors.project_date = 'project_date must be a string or null';
  }

  const sortResult = parseIntField(body.sort_order ?? 0, 'sort_order', { min: 0 });
  if (sortResult.error) {
    errors.sort_order = sortResult.error;
  } else {
    data.sort_order = sortResult.value ?? 0;
  }

  if (isUpdate) {
    const id = Number(body.project_id);
    if (!Number.isInteger(id) || id < 1) {
      errors.project_id = 'project_id is required and must be a positive integer';
    } else {
      data.project_id = id;
    }
  }

  if (data.project_date !== null && !isValidDate(data.project_date)) errors.project_date = 'project_date must be a valid YYYY-MM-DD date';
  data.status = body.status ?? 'Terminado';
  if (!["Terminado","En desarrollo","Pendiente"].includes(data.status)) errors.status = 'Invalid status';
  return { errors, data };
}

export const listProjects = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY sort_order ASC, project_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/projects]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { errors, data } = parseProjectBody(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, short_description, full_description, category, technologies, image_url, demo_url, repo_url, project_date, sort_order, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name,
        data.short_description,
        data.full_description,
        data.category,
        data.technologies,
        data.image_url,
        data.demo_url,
        data.repo_url,
        data.project_date,
        data.sort_order,
        data.status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/projects]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { errors, data } = parseProjectBody(req.body || {}, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `UPDATE projects SET
        name = $2,
        short_description = $3,
        full_description = $4,
        category = $5,
        technologies = $6,
        image_url = $7,
        demo_url = $8,
        repo_url = $9,
        project_date = $10,
        sort_order = $11,
        status = $12
       WHERE project_id = $1
       RETURNING *`,
      [
        data.project_id,
        data.name,
        data.short_description,
        data.full_description,
        data.category,
        data.technologies,
        data.image_url,
        data.demo_url,
        data.repo_url,
        data.project_date,
        data.sort_order,
        data.status,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/projects]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = Number(req.body?.project_id);
    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(400).json({ error: 'project_id is required and must be a positive integer' });
    }

    const result = await pool.query(
      'DELETE FROM projects WHERE project_id = $1 RETURNING project_id',
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ deleted: true, project_id: projectId });
  } catch (err) {
    console.error('[admin/projects]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
