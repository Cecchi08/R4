// Registra los endpoints POST de contact y conecta sus controladores.
import { Router } from 'express';
import { getContact } from '../controllers/contact.js';
// El contacto es público, sin autenticación de visitantes.
const router = Router();
router.post('/contact', getContact);
export default router;
