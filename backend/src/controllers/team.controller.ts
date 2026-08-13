import type { Request, Response } from 'express';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
} from '../schemas/team.schema.js';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
} from '../services/team.service.js';

export const createTeamController = async (req: Request, res: Response) => {
  const data = createTeamSchema.parse(req.body);

  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const team = await createTeam({
    name: data.name,
    userId: req.user.userId,
  });

  return res.status(201).json({
    success: true,
    data: team,
  });
};

export const getMyTeamsController = async (req: Request, res: Response) => {
  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const teams = await getMyTeams(req.user.userId);

  return res.status(200).json({
    success: true,
    data: teams,
  });
};

export const getTeamByIdController = async (req: Request, res: Response) => {
  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const team = await getTeamById(teamId, req.user.userId);

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
  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const data = updateTeamSchema.parse(req.body);

  const team = await updateTeam(teamId, req.user.userId, data.name);

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
  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      cuccess: false,
      message: 'Invlid teamId',
    });
  }

  const deleted = await deleteTeam(teamId, req.user.userId);

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
  if (!req.user || typeof req.user === 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const teamId = req.params.teamId;

  if (typeof teamId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid team id',
    });
  }

  const data = addTeamMemberSchema.parse(req.body);

  const member = await addTeamMember(teamId, req.user.userId, data.userId);

  if (!member) {
    return res.status(403).json({
      success: false,
      messge: 'Only the team owner can add members',
    });
  }

  return res.status(201).json({
    success: true,
    data: member,
  });
};
