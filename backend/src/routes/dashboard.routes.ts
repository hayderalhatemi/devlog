import { Router } from 'express';
import { getTeamDashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { teamParamSchema } from '../schemas/param.schema.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Dashboard
 *     description: Team dashboard
 *
 * /api/teams/{teamId}/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get team dashboard
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
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not a member of the team
 *       404:
 *         description: Team not found
 */

router.use(authMiddleware);

router.get(
  '/:teamId/dashboard',
  validate(teamParamSchema),
  getTeamDashboardController,
);

export default router;
