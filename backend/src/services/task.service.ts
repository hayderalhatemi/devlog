import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const createTask = async (
  teamId: string,
  projectId: string,
  userId: string,
  title: string,
  description?: string,
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE',
) => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new AppError('You are not a member of this team', 403);
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      teamId,
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return prisma.task.create({
    data: {
      projectId,
      title,
      description,
      status,
    },
  });
};
