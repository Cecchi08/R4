// Registra operaciones POST de about protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import {
  listAbout,
  createAbout,
  updateAbout,
  deleteAbout,
} from '../../controllers/admin/about.js';

const router = Router();

router.post('/admin/about/list', requireAuth, requireAdmin, listAbout);
router.post('/admin/about/create', requireAuth, requireAdmin, createAbout);
router.post('/admin/about/update', requireAuth, requireAdmin, updateAbout);
router.post('/admin/about/delete', requireAuth, requireAdmin, deleteAbout);

export default router;
