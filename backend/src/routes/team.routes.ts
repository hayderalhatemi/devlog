import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { teamParamSchema } from '../schemas/param.schema.js';
import {
  createTeamController,
  getMyTeamsController,
  getTeamByIdController,
  updateTeamController,
  deleteTeamController,
  addTeamMemberController,
  removeTeamMemberController,
  getTeamMembersController,
  updateTeamMemberRoleController,
  leaveTeamController,
  transferTeamOwnershipController,
} from '../controllers/team.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Teams
 *     description: Team management
 *
 * /api/teams:
 *   get:
 *     tags: [Teams]
 *     summary: Get my teams
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *
 *   post:
 *     tags: [Teams]
 *     summary: Create a team
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       201:
 *         description: Team created successfully
 *
 * /api/teams/{teamId}:
 *   get:
 *     tags: [Teams]
 *     summary: Get team by ID
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
 *         description: Team retrieved successfully
 *
 *   patch:
 *     tags: [Teams]
 *     summary: Update a team
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully
 *
 *   delete:
 *     tags: [Teams]
 *     summary: Delete a team
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
 *         description: Team deleted successfully
 *
 * /api/teams/{teamId}/members:
 *   get:
 *     tags: [Teams]
 *     summary: Get team members
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
 *         description: Members retrieved successfully
 *
 *   post:
 *     tags: [Teams]
 *     summary: Add a team member
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
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added successfully
 *
 * /api/teams/{teamId}/members/{userId}:
 *   delete:
 *     tags: [Teams]
 *     summary: Remove a team member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *
 * /api/teams/{teamId}/members/{userId}/role:
 *   patch:
 *     tags: [Teams]
 *     summary: Update team member role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *
 * /api/teams/{teamId}/leave:
 *   delete:
 *     tags: [Teams]
 *     summary: Leave a team
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
 *         description: Left team successfully
 *
 * /api/teams/{teamId}/owner/{userId}:
 *   patch:
 *     tags: [Teams]
 *     summary: Transfer team ownership
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 */

router.get('/', authMiddleware, getMyTeamsController);
router.get('/:teamId', authMiddleware, getTeamByIdController);
router.post('/', authMiddleware, createTeamController);
router.patch(
  '/:teamId',
  authMiddleware,
  validate(teamParamSchema),
  updateTeamController,
);
router.delete(
  '/:teamId',
  authMiddleware,
  validate(teamParamSchema),
  deleteTeamController,
);
router.post(
  '/:teamId/members',
  authMiddleware,
  validate(teamParamSchema),
  addTeamMemberController,
);
router.delete(
  '/:teamId/members/:userId',
  authMiddleware,
  validate(teamParamSchema),
  removeTeamMemberController,
);
router.delete(
  '/:teamId/leave',
  authMiddleware,
  validate(teamParamSchema),
  leaveTeamController,
);
router.get(
  '/:teamId/members',
  authMiddleware,
  validate(teamParamSchema),
  getTeamMembersController,
);
router.patch(
  '/:teamId/members/:userId/role',
  authMiddleware,
  validate(teamParamSchema),
  updateTeamMemberRoleController,
);
router.patch(
  '/:teamId/owner/:userId',
  authMiddleware,
  validate(teamParamSchema),
  transferTeamOwnershipController,
);

export default router;
