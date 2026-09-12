// Registra operaciones POST de education protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { listEducation, createEducation, updateEducation, deleteEducation } from '../../controllers/admin/education.js';

// Toda operación administrativa exige una sesión admin validada en PostgreSQL.
const router = Router();
router.post('/admin/education/list', requireAuth, requireAdmin, listEducation);
router.post('/admin/education/create', requireAuth, requireAdmin, createEducation);
router.post('/admin/education/update', requireAuth, requireAdmin, updateEducation);
router.post('/admin/education/delete', requireAuth, requireAdmin, deleteEducation);
export default router;
