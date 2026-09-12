// Registra los endpoints POST de about y conecta sus controladores.
import { Router } from 'express';
import { getAbout } from '../controllers/about.js';

const router = Router();

router.post('/about', getAbout);

export default router;
