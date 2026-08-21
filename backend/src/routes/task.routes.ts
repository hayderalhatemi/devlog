import { Router } from 'express';
import {
  createTaskController,
  getTasksController,
  updateTaskController,
  deleteTaskController,
  getTaskByIdController,
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

router.get(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  getTaskByIdController,
);

router.patch(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  updateTaskController,
);

router.delete(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  deleteTaskController,
);

export default router;
