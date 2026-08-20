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

export const getProjectById = async (
  teamId: string,
  projectId: string,
  userId: string,
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

  return project;
};

export const updateProject = async (
  teamId: string,
  projectId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
  },
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

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data,
  });
};

export const deleteProject = async (
  teamId: string,
  projectId: string,
  userId: string,
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

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  return true;
};
