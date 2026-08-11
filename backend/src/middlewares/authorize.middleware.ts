import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';

export const authorize =
  (...allowedRoles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (
      !req.user ||
      typeof req.user === 'string' ||
      !allowedRoles.includes(req.user.role)
    ) {
      throw new AppError('Forbidden', 403);
    }

    next();
  };
