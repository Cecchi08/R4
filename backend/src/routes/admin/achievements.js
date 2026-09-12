// Registra operaciones POST de achievements protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import {
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '../../controllers/admin/achievements.js';

const router = Router();

router.post('/admin/achievements/list', requireAuth, requireAdmin, listAchievements);
router.post('/admin/achievements/create', requireAuth, requireAdmin, createAchievement);
router.post('/admin/achievements/update', requireAuth, requireAdmin, updateAchievement);
router.post('/admin/achievements/delete', requireAuth, requireAdmin, deleteAchievement);

export default router;
