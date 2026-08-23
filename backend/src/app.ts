import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import teamRoutes from './routes/team.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.use(cors());

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

app.use('/api', taskRoutes);

app.use('/api/teams', dashboardRoutes);

app.use(errorHandler);

export default app;
