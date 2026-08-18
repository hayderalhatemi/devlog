import { Router } from 'express';
import { createTaskController } from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/teams/:teamId/projects/:projectId/tasks',
  authMiddleware,
  createTaskController,
);

export default router;
