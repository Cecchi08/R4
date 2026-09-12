// Registra los endpoints POST de projects y conecta sus controladores.
import { Router } from 'express';
import { getProjects } from '../controllers/projects.js';

const router = Router();

router.post('/projects', getProjects);

export default router;
