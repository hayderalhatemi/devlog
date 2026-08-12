import { prisma } from '../config/prisma.js';

type CreateTeamInput = {
  name: string;
  userId: string;
};

export const createTeam = async ({ name, userId }: CreateTeamInput) => {
  return prisma.team.create({
    data: {
      name,
      members: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
    },
    include: {
      members: true,
    },
  });
};

export const getMyTeams = async (userId: string) => {
  return prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      members: true,
    },
  });
};

export const getTeamById = async (teamId: string, userId: string) => {
  return prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      members: true,
    },
  });
};

export const updateTeam = async (
  teamId: string,
  userId: string,
  name: string,
) => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership || membership.role !== 'OWNER') {
    return null;
  }

  return prisma.team.update({
    where: { id: teamId },
    data: { name },
  });
};
