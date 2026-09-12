// Registra los endpoints POST de experience y conecta sus controladores.
import { Router } from 'express';
import { getExperience } from '../controllers/experience.js';

const router = Router();

router.post('/experience', getExperience);

export default router;
