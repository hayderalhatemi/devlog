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

router.get(
  '/',
  authMiddleware,
  validate(teamParamSchema),
  getMyTeamsController,
);
router.get('/:teamId', authMiddleware, getTeamByIdController);
router.post(
  '/',
  authMiddleware,
  validate(teamParamSchema),
  createTeamController,
);
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
