import { z } from 'zod';

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().positive('Page must be greater than 0')),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(
        z
          .number()
          .int()
          .positive('Limit must be greater than 0')
          .max(100, 'Limit cannot exceed 100'),
      ),
    search: z.string().optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().positive('Page must be greater than 0')),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(
        z
          .number()
          .int()
          .positive('Limit must be greater than 0')
          .max(100, 'Limit cannot exceed 100'),
      ),
    search: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    sortBy: z
      .enum(['createdAt', 'updatedAt', 'title', 'status'])
      .optional()
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
