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

/**
 * @openapi
 * tags:
 *   - name: Tasks
 *     description: Task management
 *
 * /api/teams/{teamId}/projects/{projectId}/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Insufficient permissions
 *
 *   get:
 *     tags: [Tasks]
 *     summary: Get project tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *
 * /api/teams/{teamId}/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Only owners and admins can delete tasks
 */

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
