import type { Request, Response } from 'express';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../services/task.service.js';
import { AppError } from '../utils/app-error.js';
import { taskQuerySchema } from '../schemas/query.schema.js';

type TaskParams = {
  teamId: string;
  projectId: string;
};

type UpdateTaskParams = {
  teamId: string;
  projectId: string;
  taskId: string;
};

const getUser = (req: Request) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  return req.user;
};

export const createTaskController = async (
  req: Request<TaskParams>,
  res: Response,
) => {
  const user = getUser(req);
  const data = createTaskSchema.parse(req.body);

  const task = await createTask(
    req.params.teamId,
    req.params.projectId,
    user.userId,
    data.title,
    data.description,
    data.status,
    data.assigneeId,
  );

  res.status(201).json({
    success: true,
    data: task,
  });
};

export const getTasksController = async (
  req: Request<TaskParams>,
  res: Response,
) => {
  const user = getUser(req);
  const { query } = taskQuerySchema.parse({ query: req.query });

  const result = await getTasks(
    req.params.teamId,
    req.params.projectId,
    user.userId,
    query.page,
    query.limit,
    query.status,
    query.sortBy,
    query.sortOrder,
    query.search,
  );

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
};

export const getTaskByIdController = async (
  req: Request<UpdateTaskParams>,
  res: Response,
) => {
  const user = getUser(req);

  const task = await getTaskById(
    req.params.teamId,
    req.params.projectId,
    req.params.taskId,
    user.userId,
  );

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const updateTaskController = async (
  req: Request<UpdateTaskParams>,
  res: Response,
) => {
  const user = getUser(req);
  const data = updateTaskSchema.parse(req.body);

  const task = await updateTask(
    req.params.teamId,
    req.params.projectId,
    req.params.taskId,
    user.userId,
    data,
  );

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const deleteTaskController = async (
  req: Request<UpdateTaskParams>,
  res: Response,
) => {
  const user = getUser(req);

  await deleteTask(
    req.params.teamId,
    req.params.projectId,
    req.params.taskId,
    user.userId,
  );

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
};
