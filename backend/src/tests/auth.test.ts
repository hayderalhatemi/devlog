import request from 'supertest';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import app from '../app.js';
import { prisma } from '../config/prisma.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      createdAt: new Date(),
    } as never);

    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
  });

  it('logs in with valid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: '$2b$12$abcdefghijklmnopqrstuv',
      role: 'USER',
    } as never);

    const bcrypt = await import('bcrypt');
    vi.spyOn(bcrypt.default, 'compare').mockResolvedValue(true as never);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBeDefined();
  });

  it('rejects invalid login credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await request(app).post('/api/auth/login').send({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
