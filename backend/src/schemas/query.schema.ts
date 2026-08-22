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
  }),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
