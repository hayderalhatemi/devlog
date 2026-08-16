import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  createProjectController,
  getProjectsController,
} from '../controllers/project.controller.js';

const router = Router();

router.post('/teams/:teamId/projects', authMiddleware, createProjectController);
router.get('/teams/:teamId/projects', authMiddleware, getProjectsController);

export default router;
