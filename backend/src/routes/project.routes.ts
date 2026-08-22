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
