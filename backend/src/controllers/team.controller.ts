import type { Request, Response } from 'express';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  updateTeamMemberRoleSchema,
} from '../schemas/team.schema.js';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  updateTeamMemberRole,
  leaveTeam,
} from '../services/team.service.js';
import { AppError } from '../utils/app-error.js';

const getUser = (req: Request) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  return req.user;
};

export const createTeamController = async (req: Request, res: Response) => {
  const user = getUser(req);
  const data = createTeamSchema.parse(req.body);

  const team = await createTeam({
    name: data.name,
    userId: user.userId,
  });

  return res.status(201).json({
    success: true,
    data: team,
  });
};

export const getMyTeamsController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teams = await getMyTeams(user.userId);

  return res.status(200).json({
    success: true,
    data: teams,
  });
};

export const getTeamByIdController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const team = await getTeamById(teamId, user.userId);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: team,
  });
};

export const updateTeamController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const data = updateTeamSchema.parse(req.body);

  const team = await updateTeam(teamId, user.userId, data.name);

  if (!team) {
    return res.status(403).json({
      success: false,
      message: 'Only the team owner can update this team',
    });
  }

  return res.status(200).json({
    success: true,
    data: team,
  });
};

export const deleteTeamController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const deleted = await deleteTeam(teamId, user.userId);

  if (!deleted) {
    return res.status(403).json({
      success: false,
      message: 'Only the team owner can delete this team',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Team deleted successfully',
  });
};

export const addTeamMemberController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const data = addTeamMemberSchema.parse(req.body);

  const member = await addTeamMember(teamId, user.userId, data.userId);

  if (!member) {
    return res.status(403).json({
      success: false,
      message: 'Only the team owner can add members',
    });
  }

  return res.status(201).json({
    success: true,
    data: member,
  });
};

export const removeTeamMemberController = async (
  req: Request,
  res: Response,
) => {
  const user = getUser(req);

  const teamId = req.params.teamId;
  const userId = req.params.userId;

  if (typeof teamId !== 'string' || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team or user id',
    });
  }

  const removed = await removeTeamMember(teamId, user.userId, userId);

  if (!removed) {
    return res.status(403).json({
      success: false,
      message: 'Only the team owner can remove members',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Team member removed successfully',
  });
};

export const getTeamMembersController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const members = await getTeamMembers(teamId, user.userId);

  if (!members) {
    return res.status(403).json({
      success: false,
      message: 'You are not a member of this team',
    });
  }

  return res.status(200).json({
    success: true,
    data: members,
  });
};

export const updateTeamMemberRoleController = async (
  req: Request,
  res: Response,
) => {
  const user = getUser(req);

  const teamId = req.params.teamId;
  const userId = req.params.userId;

  if (typeof teamId !== 'string' || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team or user id',
    });
  }

  const data = updateTeamMemberRoleSchema.parse(req.body);

  const member = await updateTeamMemberRole(
    teamId,
    user.userId,
    userId,
    data.role,
  );

  if (!member) {
    throw new AppError('Only the team owner can change team roles', 403);
  }

  return res.status(200).json({
    success: true,
    data: member,
  });
};

export const leaveTeamController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    throw new AppError('Invalid team id', 400);
  }

  await leaveTeam(teamId, user.userId);

  return res.status(200).json({
    success: true,
    message: 'Left team successfully',
  });
};
