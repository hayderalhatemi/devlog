import { Request, Response } from 'express';
import { getTeamDashboardMetrics } from '../services/dashboard.service.js';
import { TeamParams } from '../schemas/param.schema.js';

export const getTeamDashboardController = async (
  req: Request<TeamParams>,
  res: Response,
) => {
  const userId = req.user!.userId;
  const metrics = await getTeamDashboardMetrics(req.params.teamId, userId);

  res.status(200).json({
    success: true,
    data: metrics,
  });
};
