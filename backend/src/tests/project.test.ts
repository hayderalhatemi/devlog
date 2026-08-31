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
      create: vi.fn(),
    },
  },
}));

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a project for a team owner', async () => {
    const teamId = 'cm1234567890abcdefghijkl';
    const projectId = 'cm0987654321abcdefghijkl';

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      userId: 'user-1',
      teamId,
      role: 'OWNER',
    } as never);

    vi.mocked(prisma.project.create).mockResolvedValue({
      id: projectId,
      teamId,
      name: 'Test Project',
      description: 'Test description',
    } as never);

    const token = jwt.sign(
      {
        userId: 'user-1',
        role: 'USER',
      },
      env.JWT_SECRET,
    );

    const response = await request(app)
      .post(`/api/teams/${teamId}/projects`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        description: 'Test description',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Project');
  });

  it('rejects project creation for a non-member', async () => {
    const teamId = 'cm1234567890abcdefghijkl';

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue(null);

    const token = jwt.sign(
      {
        userId: 'user-1',
        role: 'USER',
      },
      env.JWT_SECRET,
    );

    const response = await request(app)
      .post(`/api/teams/${teamId}/projects`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
