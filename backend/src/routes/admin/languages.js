// Registra operaciones POST de languages protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { listLanguages, createLanguages, updateLanguages, deleteLanguages } from '../../controllers/admin/languages.js';

// Toda operación administrativa exige una sesión admin validada en PostgreSQL.
const router = Router();
router.post('/admin/languages/list', requireAuth, requireAdmin, listLanguages);
router.post('/admin/languages/create', requireAuth, requireAdmin, createLanguages);
router.post('/admin/languages/update', requireAuth, requireAdmin, updateLanguages);
router.post('/admin/languages/delete', requireAuth, requireAdmin, deleteLanguages);
export default router;
