// Registra operaciones POST de contact protegidas por autenticación y rol admin.
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { listContact, createContact, updateContact, deleteContact } from '../../controllers/admin/contact.js';

// Toda operación administrativa exige una sesión admin validada en PostgreSQL.
const router = Router();
router.post('/admin/contact/list', requireAuth, requireAdmin, listContact);
router.post('/admin/contact/create', requireAuth, requireAdmin, createContact);
router.post('/admin/contact/update', requireAuth, requireAdmin, updateContact);
router.post('/admin/contact/delete', requireAuth, requireAdmin, deleteContact);
export default router;
