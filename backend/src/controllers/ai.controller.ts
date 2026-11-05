import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { draftTaskSchema } from '../schemas/ai.schema.js';
import { draftTask } from '../services/ai.service.js';
import { AppError } from '../utils/app-error.js';

type DraftTaskParams = {
  teamId: string;
  projectId: string;
};

export async function draftTaskController(
  req: Request<DraftTaskParams>,
  res: Response,
) {
  const { idea } = draftTaskSchema.parse(req.body);

  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
      teamId: req.params.teamId,
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const draft = await draftTask(idea);

  res.status(200).json({
    success: true,
    data: draft,
  });
}
