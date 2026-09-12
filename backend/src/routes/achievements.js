// Registra los endpoints POST de achievements y conecta sus controladores.
import { Router } from 'express';
import { getAchievements } from '../controllers/achievements.js';

const router = Router();

router.post('/achievements', getAchievements);

export default router;
