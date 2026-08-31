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
    },
  },
}));

describe('Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a task for a team member', async () => {
    const teamId = 'cm1234567890abcdefghijkl';
    const projectId = 'cm0987654321abcdefghijkl';

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      userId: 'user-1',
      teamId,
      role: 'MEMBER',
    } as never);

    vi.mocked(prisma.project.findFirst).mockResolvedValue({
      id: projectId,
      teamId,
      name: 'Test Project',
    } as never);

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

    const token = jwt.sign(
      {
        userId: 'user-1',
        role: 'USER',
      },
      env.JWT_SECRET,
    );

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
    const teamId = 'cm1234567890abcdefghijkl';
    const projectId = 'cm0987654321abcdefghijkl';
    const taskId = 'cm1111111111abcdefghijkl';

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      userId: 'user-1',
      teamId,
      role: 'MEMBER',
    } as never);

    const token = jwt.sign(
      {
        userId: 'user-1',
        role: 'USER',
      },
      env.JWT_SECRET,
    );

    const response = await request(app)
      .delete(`/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
