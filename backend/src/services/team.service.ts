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

export const deleteTeam = async (teamId: string, userId: string) => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!membership || membership.role !== 'OWNER') {
    return false;
  }

  await prisma.$transaction([
    prisma.teamMember.deleteMany({
      where: { teamId },
    }),

    prisma.team.delete({
      where: { id: teamId },
    }),
  ]);

  return true;
};

export const addTeamMember = async (
  teamId: string,
  ownerId: string,
  userId: string,
) => {
  const ownerMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: ownerId,
        teamId,
      },
    },
  });

  if (!ownerMembership || ownerMembership.role !== 'OWNER') {
    return null;
  }

  return prisma.teamMember.create({
    data: {
      teamId,
      userId,
      role: 'MEMBER',
    },
  });
};

export const removeTeamMember = async (
  teamId: string,
  ownerId: string,
  userId: string,
) => {
  const ownerMembership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: ownerId,
        teamId,
      },
    },
  });

  if (!ownerMembership || ownerMembership.role !== 'OWNER') {
    return false;
  }

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  return true;
};

export const getTeamMembers = async (teamId: string, userId: string) => {
  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership) {
    return null;
  }

  return prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};
