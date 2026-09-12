// Registra operaciones POST de experience protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import {
  listExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../../controllers/admin/experience.js';

const router = Router();

router.post('/admin/experience/list', requireAuth, requireAdmin, listExperience);
router.post('/admin/experience/create', requireAuth, requireAdmin, createExperience);
router.post('/admin/experience/update', requireAuth, requireAdmin, updateExperience);
router.post('/admin/experience/delete', requireAuth, requireAdmin, deleteExperience);

export default router;
