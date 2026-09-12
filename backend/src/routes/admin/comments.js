// Registra operaciones POST de comments protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import {
  listComments,
  createComment,
  updateComment,
  deleteComment,
} from '../../controllers/admin/comments.js';

const router = Router();

router.post('/admin/comments/list', requireAuth, requireAdmin, listComments);
router.post('/admin/comments/create', requireAuth, requireAdmin, createComment);
router.post('/admin/comments/update', requireAuth, requireAdmin, updateComment);
router.post('/admin/comments/delete', requireAuth, requireAdmin, deleteComment);

export default router;
