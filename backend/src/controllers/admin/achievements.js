// Valida y persiste achievements utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import {
  requireString,
  isValidDate,
  sanitizeString,
  parseIntField,
} from '../../utils/validation.js';

function parseAchievementBody(body, isUpdate = false) {
  const errors = {};
  const data = {};

  const titleErr = requireString(body.title, 'title', 1, 160);
  if (titleErr) {
    errors.title = titleErr;
  } else {
    data.title = body.title.trim();
  }

  const dateErr = requireString(body.date, 'date', 1, 10);
  if (dateErr) {
    errors.date = dateErr;
  } else {
    data.date = body.date.trim();
  }

  data.description = sanitizeString(body.description, 10000);
  data.category = sanitizeString(body.category, 60);
  data.icon_or_image = sanitizeString(body.icon_or_image, 255);

  const metricResult = parseIntField(body.metric_value, 'metric_value', { min: 0 });
  if (metricResult.error) {
    errors.metric_value = metricResult.error;
  } else {
    data.metric_value = metricResult.value;
  }

  data.metric_label = sanitizeString(body.metric_label, 60);

  if (isUpdate) {
    const id = Number(body.achievement_id);
    if (!Number.isInteger(id) || id < 1) {
      errors.achievement_id = 'achievement_id is required and must be a positive integer';
    } else {
      data.achievement_id = id;
    }
  }

  if (!isValidDate(data.date)) errors.date = 'date must be a valid YYYY-MM-DD date';
  return { errors, data };
}

export const listAchievements = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM achievements ORDER BY date DESC, achievement_id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/achievements]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createAchievement = async (req, res) => {
  try {
    const { errors, data } = parseAchievementBody(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `INSERT INTO achievements (title, date, description, category, icon_or_image, metric_value, metric_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.date,
        data.description,
        data.category,
        data.icon_or_image,
        data.metric_value,
        data.metric_label,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/achievements]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const updateAchievement = async (req, res) => {
  try {
    const { errors, data } = parseAchievementBody(req.body || {}, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      `UPDATE achievements SET
        title = $2,
        date = $3,
        description = $4,
        category = $5,
        icon_or_image = $6,
        metric_value = $7,
        metric_label = $8
       WHERE achievement_id = $1
       RETURNING *`,
      [
        data.achievement_id,
        data.title,
        data.date,
        data.description,
        data.category,
        data.icon_or_image,
        data.metric_value,
        data.metric_label,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/achievements]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const achievementId = Number(req.body?.achievement_id);
    if (!Number.isInteger(achievementId) || achievementId < 1) {
      return res.status(400).json({ error: 'achievement_id is required and must be a positive integer' });
    }

    const result = await pool.query(
      'DELETE FROM achievements WHERE achievement_id = $1 RETURNING achievement_id',
      [achievementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ deleted: true, achievement_id: achievementId });
  } catch (err) {
    console.error('[admin/achievements]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
