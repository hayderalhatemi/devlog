import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const getTeamDashboardMetrics = async (
  teamId: string,
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

  const [totalProjects, totalTasks, tasksByStatus, totalMembers] =
    await Promise.all([
      prisma.project.count({
        where: { teamId },
      }),
      prisma.task.count({
        where: {
          project: { teamId },
        },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: {
          project: { teamId },
        },
        _count: {
          status: true,
        },
      }),
      prisma.teamMember.count({
        where: { teamId },
      }),
    ]);

  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };

  tasksByStatus.forEach((item) => {
    statusCounts[item.status] = item._count.status;
  });

  return {
    totalProjects,
    totalTasks,
    totalMembers,
    tasksByStatus: statusCounts,
  };
};
