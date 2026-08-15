import { Router } from 'express';
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

router.get('/', authMiddleware, getMyTeamsController);
router.get('/:teamId', authMiddleware, getTeamByIdController);
router.post('/', authMiddleware, createTeamController);
router.patch('/:teamId', authMiddleware, updateTeamController);
router.delete('/:teamId', authMiddleware, deleteTeamController);
router.post('/:teamId/members', authMiddleware, addTeamMemberController);
router.delete(
  '/:teamId/members/:userId',
  authMiddleware,
  removeTeamMemberController,
);
router.delete('/:teamId/leave', authMiddleware, leaveTeamController);
router.get('/:teamId/members', authMiddleware, getTeamMembersController);
router.patch(
  '/:teamId/members/:userId/role',
  authMiddleware,
  updateTeamMemberRoleController,
);
router.patch(
  '/:teamId/owner/:userId',
  authMiddleware,
  transferTeamOwnershipController,
);

export default router;
