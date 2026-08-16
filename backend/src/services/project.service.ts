import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const createProject = async (
  teamId: string,
  userId: string,
  name: string,
  description?: string,
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

  return prisma.project.create({
    data: {
      teamId,
      name,
      description,
    },
  });
};

export const getProjects = async (teamId: string, userId: string) => {
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

  return prisma.project.findMany({
    where: {
      teamId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
