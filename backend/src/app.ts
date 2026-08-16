import express from 'express';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';
import projectRoutes from './routes/project.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'DevLog API is running',
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/teams', teamRoutes);

app.use('/api', projectRoutes);

app.use(errorHandler);

export default app;
