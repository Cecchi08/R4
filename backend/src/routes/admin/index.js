// Registra operaciones POST de index protegidas por autenticación y rol admin.
import contactRouter from './contact.js';
import languagesRouter from './languages.js';
import educationRouter from './education.js';
import { Router } from 'express';
import aboutRouter from './about.js';
import skillsRouter from './skills.js';
import experienceRouter from './experience.js';
import achievementsRouter from './achievements.js';
import projectsRouter from './projects.js';
import commentsRouter from './comments.js';

const router = Router();
router.use(contactRouter);
router.use(languagesRouter);
router.use(educationRouter);

router.use(aboutRouter);
router.use(skillsRouter);
router.use(experienceRouter);
router.use(achievementsRouter);
router.use(projectsRouter);
router.use(commentsRouter);

export default router;
