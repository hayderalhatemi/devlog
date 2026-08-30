import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  teamParamSchema,
  projectParamSchema,
} from '../schemas/param.schema.js';
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/project.controller.js';
import { requireTeamRole } from '../middlewares/team-role.middleware.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Projects
 *     description: Project management
 *
 * /api/teams/{teamId}/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *       403:
 *         description: Insufficient permissions
 *
 *   get:
 *     tags: [Projects]
 *     summary: Get team projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *
 * /api/teams/{teamId}/projects/{projectId}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
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
 *         description: Project retrieved successfully
 *
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Insufficient permissions
 *
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
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
 *         description: Project deleted successfully
 *       403:
 *         description: Insufficient permissions
 */

router.post(
  '/teams/:teamId/projects',
  authMiddleware,
  validate(teamParamSchema),
  requireTeamRole(['OWNER', 'ADMIN']),
  createProjectController,
);
router.get(
  '/teams/:teamId/projects',
  authMiddleware,
  validate(teamParamSchema),
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  getProjectsController,
);

router.get(
  '/teams/:teamId/projects/:projectId',
  authMiddleware,
  validate(projectParamSchema),
  requireTeamRole(['OWNER', 'ADMIN', 'MEMBER']),
  getProjectByIdController,
);

router.patch(
  '/teams/:teamId/projects/:projectId',
  authMiddleware,
  validate(projectParamSchema),
  requireTeamRole(['OWNER', 'ADMIN']),
  updateProjectController,
);

router.delete(
  '/teams/:teamId/projects/:projectId',
  authMiddleware,
  validate(projectParamSchema),
  requireTeamRole(['OWNER', 'ADMIN']),
  deleteProjectController,
);

export default router;
