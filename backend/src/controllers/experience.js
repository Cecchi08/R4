// Consulta experience y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

export const getExperience = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM experience ORDER BY start_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[experience]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
