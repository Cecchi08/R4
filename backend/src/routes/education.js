// Registra los endpoints POST de education y conecta sus controladores.
import { Router } from 'express';
import pool from '../db/index.js';
const router = Router();
router.post('/education', async (_req, res) => {
  try { res.json((await pool.query('SELECT education_id, institution, title, start_year, end_year, status FROM education ORDER BY start_year DESC, education_id ASC')).rows); }
  catch (err) { console.error('[education]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
});
export default router;
