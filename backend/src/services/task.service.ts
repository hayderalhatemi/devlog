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

export const getTasks = async (
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

  return prisma.task.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const updateTask = async (
  teamId: string,
  projectId: string,
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return prisma.task.update({
    where: {
      id: taskId,
    },
    data,
  });
};

export const deleteTask = async (
  teamId: string,
  projectId: string,
  taskId: string,
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return true;
};

export const getTaskById = async (
  teamId: string,
  projectId: string,
  taskId: string,
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

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project,
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};
