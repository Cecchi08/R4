// Registra los endpoints POST de index y conecta sus controladores.
import contactRouter from './contact.js';
import { Router } from 'express';
import aboutRouter from './about.js';
import skillsRouter from './skills.js';
import experienceRouter from './experience.js';
import achievementsRouter from './achievements.js';
import projectsRouter from './projects.js';
import commentsRouter from './comments.js';
import authRouter from './auth.js';
import adminRouter from './admin/index.js';

import educationRouter from './education.js';
import languagesRouter from './languages.js';

const router = Router();
router.use(contactRouter);
router.use(educationRouter);
router.use(languagesRouter);

router.use(aboutRouter);
router.use(skillsRouter);
router.use(experienceRouter);
router.use(achievementsRouter);
router.use(projectsRouter);
router.use(commentsRouter);
router.use(authRouter);
router.use(adminRouter);

export default router;
