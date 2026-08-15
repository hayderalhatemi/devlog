import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

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
    throw new AppError('Only the team owner can update the team', 403);
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
    throw new AppError('Only the team owner can delete the team', 403);
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
    throw new AppError('Only the team owner can add members', 403);
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (existingMember) {
    throw new AppError('User is already a team member', 409);
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
    throw new AppError('Only the team owner can remove members', 403);
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
    throw new AppError('You are not a member of this team', 403);
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

export const updateTeamMemberRole = async (
  teamId: string,
  ownerId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER',
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
    throw new AppError('Only the team owner can update member roles', 403);
  }

  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!member) {
    throw new AppError('User is not a team member', 403);
  }

  if (member.role === 'OWNER') {
    throw new AppError('Owner role cannot be changed', 400);
  }

  return prisma.teamMember.update({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
    data: {
      role,
    },
  });
};

export const leaveTeam = async (teamId: string, userId: string) => {
  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!member) {
    throw new AppError('You are not a member of this team', 400);
  }

  if (member.role === 'OWNER') {
    throw new AppError('The team owner cannot leave the team', 400);
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

export const transferTeamOwnership = async (
  teamId: string,
  ownerId: string,
  newOwnerId: string,
) => {
  const owner = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: ownerId,
        teamId,
      },
    },
  });

  if (!owner || owner.role !== 'OWNER') {
    throw new AppError('Only the team owner can transfer ownership', 403);
  }

  const newOwner = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: newOwnerId,
        teamId,
      },
    },
  });

  if (!newOwner) {
    throw new AppError('New owner must be a team member', 400);
  }

  if (ownerId === newOwnerId) {
    throw new AppError('You are already the team owner', 400);
  }

  await prisma.$transaction([
    prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId: ownerId,
          teamId,
        },
      },
      data: {
        role: 'MEMBER',
      },
    }),
    prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId: newOwnerId,
          teamId,
        },
      },
      data: {
        role: 'OWNER',
      },
    }),
  ]);

  return true;
};
