// Consulta about y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

export const getAbout = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('[about]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
