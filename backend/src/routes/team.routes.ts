import { Router } from 'express';
import {
  createTeamController,
  getMyTeamsController,
  getTeamByIdController,
} from '../controllers/team.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getMyTeamsController);
router.get('/:teamId', authMiddleware, getTeamByIdController);
router.post('/', authMiddleware, createTeamController);

export default router;
