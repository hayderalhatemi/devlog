import express from 'express';
import request from 'supertest';
import { afterEach, expect, it, vi } from 'vitest';
import { aiLimit } from '../middlewares/ai-limit.middleware.js';
import { errorHandler } from '../middlewares/error.middleware.js';

afterEach(() => {
  vi.restoreAllMocks();
});

it('blocks request 11 and allows requests after one hour', async () => {
  const start = Date.now();
  const clock = vi.spyOn(Date, 'now').mockReturnValue(start);
  const app = express();

  app.post(
    '/draft',
    (req, _res, next) => {
      req.user = { userId: 'limit-test-user', role: 'USER' };
      next();
    },
    aiLimit,
    (_req, res) => {
      res.sendStatus(200);
    },
  );

  app.use(errorHandler);

  for (let count = 0; count < 10; count++) {
    const response = await request(app).post('/draft');
    expect(response.status).toBe(200);
  }

  const blocked = await request(app).post('/draft');

  expect(blocked.status).toBe(429);
  expect(blocked.headers['retry-after']).toBe('3600');

  clock.mockReturnValue(start + 60 * 60 * 1000);

  const allowed = await request(app).post('/draft');
  expect(allowed.status).toBe(200);
});
