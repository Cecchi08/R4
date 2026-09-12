// Registra los endpoints POST de comments y conecta sus controladores.
import { Router } from 'express';
import { listComments, createComment } from '../controllers/comments.js';

const router = Router();

router.post('/comments/list', listComments);
router.post('/comments/create', createComment);

export default router;
