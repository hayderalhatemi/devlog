import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    team: {
      create: vi.fn(),
    },
  },
}));

describe('Teams API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a team for an authenticated user', async () => {
    vi.mocked(prisma.team.create).mockResolvedValue({
      id: 'team-1',
      name: 'Test Team',
      members: [
        {
          userId: 'user-1',
          role: 'OWNER',
        },
      ],
    } as never);

    const token = jwt.sign(
      {
        userId: 'user-1',
        role: 'USER',
      },
      env.JWT_SECRET,
    );

    const response = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Team',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Team');
  });

  it('rejects unauthenticated team creation', async () => {
    const response = await request(app).post('/api/teams').send({
      name: 'Test Team',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
