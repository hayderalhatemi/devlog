import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createProjectController } from '../controllers/project.controller.js';

const router = Router();

router.post('/teams/:teamId/projects', authMiddleware, createProjectController);

export default router;
