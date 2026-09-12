// Consulta achievements y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

export const getAchievements = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM achievements ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[achievements]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
