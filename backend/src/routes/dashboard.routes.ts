import { Router } from 'express';
import { getTeamDashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { teamParamSchema } from '../schemas/param.schema.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:teamId/dashboard',
  validate(teamParamSchema),
  getTeamDashboardController,
);

export default router;
