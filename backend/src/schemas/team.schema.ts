import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const addTeamMemberSchema = z.object({
  email: z.string().trim().email(),
});

export const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});
