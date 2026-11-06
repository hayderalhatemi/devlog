import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';

const usage = new Map<string, { count: number; resetAt: number }>();

export function aiLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const now = Date.now();

  for (const [userId, entry] of usage) {
    if (entry.resetAt <= now) {
      usage.delete(userId);
    }
  }

  const entry = usage.get(req.user.userId) ?? {
    count: 0,
    resetAt: now + 60 * 60 * 1000,
  };

  if (entry.count >= 10) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));

    throw new AppError('AI usage limit reached. Please try again later.', 429);
  }

  entry.count += 1;
  usage.set(req.user.userId, entry);

  next();
}
