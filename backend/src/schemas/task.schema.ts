import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});
