// Registra los endpoints POST de languages y conecta sus controladores.
import { Router } from 'express';
import pool from '../db/index.js';
const router = Router();
router.post('/languages', async (_req, res) => {
  try { res.json((await pool.query('SELECT * FROM languages ORDER BY sort_order ASC, language_id ASC')).rows); }
  catch (err) { console.error('[languages]', err.message); res.status(500).json({ error: 'Database operation failed' }); }
});
export default router;
