import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    teamMember: {
      findUnique: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Tasks API', () => {
  const teamId = 'cm1234567890abcdefghijkl';
  const projectId = 'cm0987654321abcdefghijkl';
  const userId = 'user-1';

  const token = jwt.sign(
    {
      userId,
      role: 'USER',
    },
    env.JWT_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockMemberAndProject() {
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      userId,
      teamId,
      role: 'MEMBER',
    } as never);

    vi.mocked(prisma.project.findFirst).mockResolvedValue({
      id: projectId,
      teamId,
      name: 'Test Project',
    } as never);
  }

  it('creates a task for a team member', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.create).mockResolvedValue({
      id: 'cm1111111111abcdefghijkl',
      projectId,
      title: 'Test Task',
      description: 'Test description',
      status: 'TODO',
      assigneeId: null,
      dueDate: new Date('2026-09-15T12:00:00.000Z'),
      priority: 'HIGH',
    } as never);

    const response = await request(app)
      .post(`/api/teams/${teamId}/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'Test description',
        status: 'TODO',
        dueDate: '2026-09-15T12:00:00.000Z',
        priority: 'HIGH',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Task');
    expect(response.body.data.priority).toBe('HIGH');
  });

  it('rejects task deletion for a member', async () => {
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      userId,
      teamId,
      role: 'MEMBER',
    } as never);

    const taskId = 'cm1111111111abcdefghijkl';

    const response = await request(app)
      .delete(`/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('returns paginated tasks', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.findMany).mockResolvedValue([
      {
        id: 'task-1',
        title: 'Task 1',
        projectId,
      },
      {
        id: 'task-2',
        title: 'Task 2',
        projectId,
      },
    ] as never);

    vi.mocked(prisma.task.count).mockResolvedValue(12);

    const response = await request(app)
      .get(`/api/teams/${teamId}/projects/${projectId}/tasks?page=2&limit=2`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);

    expect(response.body.meta).toEqual({
      page: 2,
      limit: 2,
      totalItems: 12,
      totalPages: 6,
      hasNextPage: true,
      hasPrevPage: true,
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 2,
        take: 2,
      }),
    );
  });

  it('filters tasks by status and priority', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.findMany).mockResolvedValue([]);
    vi.mocked(prisma.task.count).mockResolvedValue(0);

    const response = await request(app)
      .get(
        `/api/teams/${teamId}/projects/${projectId}/tasks?status=IN_PROGRESS&priority=HIGH`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId,
          status: 'IN_PROGRESS',
          priority: 'HIGH',
        }),
      }),
    );

    expect(prisma.task.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        projectId,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      }),
    });
  });

  it('searches tasks by title or description', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.findMany).mockResolvedValue([]);
    vi.mocked(prisma.task.count).mockResolvedValue(0);

    const response = await request(app)
      .get(`/api/teams/${teamId}/projects/${projectId}/tasks?search=login`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId,
          OR: [
            {
              title: {
                contains: 'login',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: 'login',
                mode: 'insensitive',
              },
            },
          ],
        }),
      }),
    );
  });

  it('filters tasks by assignee', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.findMany).mockResolvedValue([]);
    vi.mocked(prisma.task.count).mockResolvedValue(0);

    const assigneeId = 'user-2';

    const response = await request(app)
      .get(
        `/api/teams/${teamId}/projects/${projectId}/tasks?assigneeId=${assigneeId}`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId,
          assigneeId,
        }),
      }),
    );
  });

  it('filters unassigned tasks', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.findMany).mockResolvedValue([]);
    vi.mocked(prisma.task.count).mockResolvedValue(0);

    const response = await request(app)
      .get(
        `/api/teams/${teamId}/projects/${projectId}/tasks?assigneeId=UNASSIGNED`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId,
          assigneeId: null,
        }),
      }),
    );
  });

  it('sorts tasks by due date', async () => {
    mockMemberAndProject();

    vi.mocked(prisma.task.findMany).mockResolvedValue([]);
    vi.mocked(prisma.task.count).mockResolvedValue(0);

    const response = await request(app)
      .get(
        `/api/teams/${teamId}/projects/${projectId}/tasks?sortBy=dueDate&sortOrder=asc`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          dueDate: 'asc',
        },
      }),
    );
  });
});
