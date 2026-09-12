// Consulta contact y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

// Devuelve el contacto publicado, con los mismos nombres definidos en schema.sql.
export const getContact = async (_req, res) => {
  try {
    const result = await pool.query('SELECT contact_id, email, phone, github_url, linkedin_url, public_location FROM profile_contact ORDER BY contact_id ASC LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) { console.error('[contact]', err.message); res.status(500).json({ error: 'Unable to load contact' }); }
};
