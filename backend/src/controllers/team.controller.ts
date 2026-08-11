import type { Request, Response } from 'express';
import { createTeamSchema } from '../schemas/team.schema.js';
import { createTeam } from '../services/team.service.js';

export const createTeamController = async (req: Request, res: Response) => {
  const data = createTeamSchema.parse(req.body);

  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const team = await createTeam({
    name: data.name,
    userId: req.user.userId,
  });

  return res.status(201).json({
    success: true,
    data: team,
  });
};
