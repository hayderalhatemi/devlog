import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { registerUser, loginUser } from '../services/auth.service.js';

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const user = await registerUser(data);

  res.status(201).json({
    success: true,
    data: user,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const result = await loginUser(data);

  res.status(200).json({
    success: true,
    data: result,
  });
};
