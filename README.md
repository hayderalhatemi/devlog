# DevLog

DevLog is a full-stack issue tracking application inspired by Jira. It allows teams to organize projects, manage members, assign tasks, track priorities and due dates, and filter/search project work.

The project was built as a portfolio project with a focus on REST API design, authentication and authorization, relational data modelling, validation, testing, and a responsive frontend.

## Live Demo

- Frontend: https://devlog-seven-livid.vercel.app
- API: https://devlog-api-10nk.onrender.com
- API Documentation: https://devlog-api-10nk.onrender.com/api-docs

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Protected API routes
- Automatic logout when authentication expires

### Teams

- Create, edit, and delete teams
- Add registered users by email
- Owner, admin, and member roles
- Update member roles
- Remove members
- Transfer team ownership
- Leave a team

### Projects

- Create, view, edit, and delete projects
- Projects belong to teams
- Team-based authorization

### Tasks

- Create, view, edit, and delete tasks
- Task statuses: To Do, In Progress, Done
- Priorities: Low, Medium, High
- Assign tasks to team members
- Due dates and overdue indication
- Search by title or description
- Filter by status, priority, and assignee
- Filter unassigned tasks
- Sort by newest, due date, or priority
- Server-side pagination
- Filters and pagination preserved in the URL
- Retry handling for failed task requests

### Dashboard

- View teams
- Team member counts
- Project counts

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- JWT authentication
- bcrypt

### Development and Quality

- Vitest
- Supertest
- ESLint
- Prettier
- Swagger / OpenAPI
- Docker
- GitHub Actions CI

## Architecture

The backend follows a layered structure:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Prisma
  ↓
PostgreSQL
```

Responsibilities are separated between:

- **Routes** — API endpoints and middleware
- **Controllers** — HTTP request and response handling
- **Services** — business logic and database operations
- **Schemas** — request and query validation with Zod
- **Middleware** — authentication, authorization, validation, and error handling

The frontend uses the Next.js App Router and communicates with the backend through REST APIs.

## Authorization

DevLog uses team-based roles:

| Role | Main permissions |
| --- | --- |
| Owner | Full team management, ownership transfer, projects and tasks |
| Admin | Team administration, projects and tasks |
| Member | Access team projects and work with tasks |

Backend authorization is enforced through middleware and service-level checks.

## API

The backend provides REST endpoints for:

```text
/api/auth
/api/teams
/api/teams/:teamId/members
/api/teams/:teamId/projects
/api/teams/:teamId/projects/:projectId/tasks
/api/teams/:teamId/dashboard
```

Swagger/OpenAPI documentation is available while the backend is running:

```text
http://localhost:3001/api-docs
```

The task API supports server-side pagination, search, filtering, and sorting.

## Testing

Backend API tests use **Vitest** and **Supertest**.

Current tests cover authentication, teams, projects, tasks, authorization, task filtering, search, sorting, assignment, and pagination behavior.

Run the tests with:

```bash
cd backend
npm test
```

## Continuous Integration

GitHub Actions runs automated checks for both the backend and frontend on pushes and pull requests.

Backend CI checks:

```text
Install dependencies
Generate Prisma Client
Lint
Formatting
Build
Tests
```

Frontend CI checks:

```text
Install dependencies
Lint
Formatting
Build
```

## Local Development

### Requirements

Install:

- Node.js
- npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/hayderalhatemi/devlog.git
cd devlog
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Example:

```env
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:3000
```

Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3001
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Docker

The backend includes a Dockerfile.

Build the image from the `backend` directory:

```bash
docker build -t devlog-backend .
```

Run it with the required environment variables for the database, JWT secret, and frontend URL.

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## Project Structure

```text
devlog/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── tests/
│       └── utils/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
└── .github/
    └── workflows/
```

## Screenshots

### Dashboard

![DevLog dashboard](docs/screenshots/dashboard.png)

### Projects

![DevLog projects](docs/screenshots/projects.png)

### Task Management

![DevLog task management](docs/screenshots/tasks.png)

### Team Members

![DevLog team members](docs/screenshots/members.png)

## Status

DevLog is deployed and feature-complete for its current portfolio scope.