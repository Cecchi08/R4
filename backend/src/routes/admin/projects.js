// Registra operaciones POST de projects protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../controllers/admin/projects.js';

const router = Router();

router.post('/admin/projects/list', requireAuth, requireAdmin, listProjects);
router.post('/admin/projects/create', requireAuth, requireAdmin, createProject);
router.post('/admin/projects/update', requireAuth, requireAdmin, updateProject);
router.post('/admin/projects/delete', requireAuth, requireAdmin, deleteProject);

export default router;
