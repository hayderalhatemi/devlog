import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const requireTeamRole = (
  allowedRoles: Array<'OWNER' | 'ADMIN' | 'MEMBER'>,
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const teamId = req.params.teamId as string;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!teamId) {
      throw new AppError('Team ID parameter missing', 400);
    }

    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!membership) {
      throw new AppError('You are not a member of this team', 403);
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403,
      );
    }

    next();
  };
};
