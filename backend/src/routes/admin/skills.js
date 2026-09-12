// Registra operaciones POST de skills protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import {
  listSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../../controllers/admin/skills.js';

const router = Router();

router.post('/admin/skills/list', requireAuth, requireAdmin, listSkills);
router.post('/admin/skills/create', requireAuth, requireAdmin, createSkill);
router.post('/admin/skills/update', requireAuth, requireAdmin, updateSkill);
router.post('/admin/skills/delete', requireAuth, requireAdmin, deleteSkill);

export default router;
