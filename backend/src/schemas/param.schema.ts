import { z } from 'zod';

export const teamParamSchema = z.object({
  params: z.object({
    teamId: z.string().cuid('Invalid team ID format'),
  }),
});

export const projectParamSchema = z.object({
  params: z.object({
    teamId: z.string().cuid('Invalid team ID format'),
    projectId: z.string().cuid('Invalid project ID format'),
  }),
});

export const taskParamSchema = z.object({
  params: z.object({
    teamId: z.string().cuid('Invalid team ID format'),
    projectId: z.string().cuid('Invalid project ID format'),
    taskId: z.string().cuid('Invalid task ID format'),
  }),
});

export type TeamParams = z.infer<typeof teamParamSchema>['params'];
export type TeamParamInput = z.infer<typeof teamParamSchema>;
export type ProjectParamInput = z.infer<typeof projectParamSchema>;
export type TaskParamInput = z.infer<typeof taskParamSchema>;
