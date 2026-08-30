import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import {
  projectParamSchema,
  taskParamSchema,
} from '../schemas/param.schema.js';
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
  validate(projectParamSchema),
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  createTaskController,
);

router.get(
  '/teams/:teamId/projects/:projectId/tasks',
  authMiddleware,
  validate(projectParamSchema),
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  getTasksController,
);

router.get(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  validate(taskParamSchema),
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  getTaskByIdController,
);

router.patch(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  validate(taskParamSchema),
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  updateTaskController,
);

router.delete(
  '/teams/:teamId/projects/:projectId/tasks/:taskId',
  authMiddleware,
  validate(taskParamSchema),
  requireTeamRole(['OWNER', 'ADMIN']),
  deleteTaskController,
);

export default router;
