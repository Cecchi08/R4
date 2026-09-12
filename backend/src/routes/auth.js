// Registra los endpoints POST de auth y conecta sus controladores.
import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.js';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/me', me);

export default router;
