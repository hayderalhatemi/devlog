import type { Request, Response } from 'express';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../services/project.service.js';
import { AppError } from '../utils/app-error.js';
import { paginationQuerySchema } from '../schemas/query.schema.js';

type TeamParams = {
  teamId: string;
};

type ProjectParams = {
  teamId: string;
  projectId: string;
};

const getUser = (req: Request) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  return req.user;
};

export const createProjectController = async (
  req: Request<TeamParams>,
  res: Response,
) => {
  const user = getUser(req);
  const data = createProjectSchema.parse(req.body);

  const project = await createProject(
    req.params.teamId,
    user.userId,
    data.name,
    data.description,
  );

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjectsController = async (
  req: Request<TeamParams>,
  res: Response,
) => {
  const user = getUser(req);
  const { query } = paginationQuerySchema.parse({ query: req.query });

  const result = await getProjects(
    req.params.teamId,
    user.userId,
    query.page,
    query.limit,
  );

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
};

export const getProjectByIdController = async (
  req: Request<ProjectParams>,
  res: Response,
) => {
  const user = getUser(req);

  const project = await getProjectById(
    req.params.teamId,
    req.params.projectId,
    user.userId,
  );

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const updateProjectController = async (
  req: Request<ProjectParams>,
  res: Response,
) => {
  const user = getUser(req);
  const data = updateProjectSchema.parse(req.body);

  const project = await updateProject(
    req.params.teamId,
    req.params.projectId,
    user.userId,
    data,
  );

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const deleteProjectController = async (
  req: Request<ProjectParams>,
  res: Response,
) => {
  const user = getUser(req);

  await deleteProject(req.params.teamId, req.params.projectId, user.userId);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
};
