import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().trim().min(1),
});

export const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});
