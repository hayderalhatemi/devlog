import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
