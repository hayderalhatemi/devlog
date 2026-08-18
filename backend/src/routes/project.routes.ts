import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
} from '../controllers/project.controller.js';

const router = Router();

router.post('/teams/:teamId/projects', authMiddleware, createProjectController);
router.get('/teams/:teamId/projects', authMiddleware, getProjectsController);
router.get(
  '/teams/:teamId/projects/:projectId',
  authMiddleware,
  getProjectByIdController,
);

export default router;
