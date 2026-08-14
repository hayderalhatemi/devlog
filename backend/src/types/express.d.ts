import type { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user: AuthPayload;
    }
  }
}

export {};
