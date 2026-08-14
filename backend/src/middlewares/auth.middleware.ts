import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import type { AuthPayload } from '../types/express.js';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === 'string') {
      throw new AppError('Invalid token', 401);
    }

    req.user = decoded as AuthPayload;

    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
