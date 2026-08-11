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
