import { z } from 'zod';

export const draftTaskSchema = z.object({
  idea: z.string().trim().min(5).max(2000),
});

export const taskDraftResponseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(3000),
});
