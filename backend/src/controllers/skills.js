// Consulta skills y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

export const getSkills = async (req, res) => {
  try {
    const { category } = req.body || {};
    let query = 'SELECT * FROM skills';
    const params = [];

    if (category !== undefined && category !== null) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY sort_order ASC, skill_id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[skills]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
