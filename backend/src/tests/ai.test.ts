import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../app.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { draftTask } from '../services/ai.service.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    teamMember: { findUnique: vi.fn() },
    project: { findFirst: vi.fn() },
  },
}));

vi.mock('../services/ai.service.js', () => ({
  draftTask: vi.fn(),
}));

describe('AI task draft API', () => {
  const teamId = 'cm1234567890abcdefghijkl';
  const projectId = 'cm0987654321abcdefghijkl';
  const url = `/api/teams/${teamId}/projects/${projectId}/tasks/draft`;

  const token = jwt.sign({ userId: 'user-1', role: 'USER' }, env.JWT_SECRET);

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      userId: 'user-1',
      teamId,
      role: 'MEMBER',
    } as never);

    vi.mocked(prisma.project.findFirst).mockResolvedValue({
      id: projectId,
      teamId,
    } as never);
  });

  it('returns a draft for a team member', async () => {
    const draft = {
      title: 'Add dark mode',
      description: 'Allow users to switch between light and dark colours.',
    };

    vi.mocked(draftTask).mockResolvedValue(draft);

    const response = await request(app)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: 'We need dark mode' });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(draft);
    expect(draftTask).toHaveBeenCalledWith('We need dark mode');
  });

  it('rejects users who are not logged in', async () => {
    const response = await request(app)
      .post(url)
      .send({ idea: 'We need dark mode' });

    expect(response.status).toBe(401);
    expect(draftTask).not.toHaveBeenCalled();
  });

  it('rejects users outside the team', async () => {
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue(null);

    const response = await request(app)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: 'We need dark mode' });

    expect(response.status).toBe(403);
    expect(draftTask).not.toHaveBeenCalled();
  });

  it('rejects an empty idea', async () => {
    const response = await request(app)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: '' });

    expect(response.status).toBe(400);
    expect(draftTask).not.toHaveBeenCalled();
  });

  it('rejects a project outside the team', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const response = await request(app)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: 'We need dark mode' });

    expect(response.status).toBe(404);
    expect(draftTask).not.toHaveBeenCalled();
  });
});
