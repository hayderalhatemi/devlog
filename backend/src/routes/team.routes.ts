import { Router } from 'express';
import { createTeamController } from '../controllers/team.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createTeamController);

export default router;
