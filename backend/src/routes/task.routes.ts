import { Router } from 'express';
import {
  createTaskController,
  getTasksController,
  updateTaskController,
  deleteTaskController,
  getTaskByIdController,
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireTeamRole } from '../middlewares/team-role.middleware.js';

const router = Router();

router.post(
  '/teams/:teamId/projects/:projectId/tasks',
  authMiddleware,
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  createTaskController,
);

router.get(
  '/teams/:teamId/projects/:projectId/tasks',
  authMiddleware,
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  getTasksController,
);

router.get(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  getTaskByIdController,
);

router.patch(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  updateTaskController,
);

router.delete(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  deleteTaskController,
);

export default router;
