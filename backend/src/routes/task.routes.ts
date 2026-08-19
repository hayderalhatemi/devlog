import { Router } from 'express';
import {
  createTaskController,
  getTasksController,
  updateTaskController,
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/teams/:teamId/projects/:projectId/tasks',
  authMiddleware,
  createTaskController,
);
router.get(
  '/teams/:teamId/projects/:projectId/tasks',
  authMiddleware,
  getTasksController,
);
router.patch(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  updateTaskController,
);

export default router;
