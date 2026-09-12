// Consulta projects y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

export const getProjects = async (req, res) => {
  try {
    const { category } = req.body || {};
    let query = 'SELECT * FROM projects';
    const params = [];

    if (category !== undefined && category !== null) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY sort_order ASC, project_id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[projects]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
