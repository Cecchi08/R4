// Registra los endpoints POST de skills y conecta sus controladores.
import { Router } from 'express';
import { getSkills } from '../controllers/skills.js';

const router = Router();

router.post('/skills', getSkills);

export default router;
