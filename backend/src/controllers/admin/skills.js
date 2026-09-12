// Valida y persiste skills utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import {
  requireString,
  sanitizeString,
  parseIntField,
} from '../../utils/validation.js';

function parseSkillBody(body, isUpdate = false) {
  const errors = {};
  const data = {};

  const nameErr = requireString(body.name, 'name', 1, 80);
  if (nameErr) {
    errors.name = nameErr;
  } else {
    data.name = body.name.trim();
  }

  const categoryErr = requireString(body.category, 'category', 1, 60);
  if (categoryErr) {
    errors.category = categoryErr;
  } else {
    data.category = body.category.trim();
  }

  const levelResult = parseIntField(body.level, 'level', { min: 0, max: 100, required: true });
  if (levelResult.error) {
    errors.level = levelResult.error;
  } else {
    data.level = levelResult.value;
  }

  data.description = sanitizeString(body.description, 5000) ?? '';

  const sortResult = parseIntField(body.sort_order ?? 0, 'sort_order', { min: 0 });
  if (sortResult.error) {
    errors.sort_order = sortResult.error;
  } else {
    data.sort_order = sortResult.value ?? 0;
  }

  if (isUpdate) {
    const id = Number(body.skill_id);
    if (!Number.isInteger(id) || id < 1) {
      errors.skill_id = 'skill_id is required and must be a positive integer';
    } else {
      data.skill_id = id;
    }
  }

  return { errors, data };
}

export const listSkills = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM skills ORDER BY sort_order ASC, skill_id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/skills]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createSkill = async (req, res) => {
  try {
    const { errors, data } = parseSkillBody(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `INSERT INTO skills (name, category, level, description, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.category, data.level, data.description, data.sort_order]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/skills]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { errors, data } = parseSkillBody(req.body || {}, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `UPDATE skills SET
        name = $2,
        category = $3,
        level = $4,
        description = $5,
        sort_order = $6
       WHERE skill_id = $1
       RETURNING *`,
      [data.skill_id, data.name, data.category, data.level, data.description, data.sort_order]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/skills]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skillId = Number(req.body?.skill_id);
    if (!Number.isInteger(skillId) || skillId < 1) {
      return res.status(400).json({ error: 'skill_id is required and must be a positive integer' });
    }

    const result = await pool.query(
      'DELETE FROM skills WHERE skill_id = $1 RETURNING skill_id',
      [skillId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ deleted: true, skill_id: skillId });
  } catch (err) {
    console.error('[admin/skills]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
