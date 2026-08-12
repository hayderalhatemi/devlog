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
