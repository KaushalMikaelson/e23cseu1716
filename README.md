# Campus Notification Platform

A fullstack campus notification management system.

## Project Structure

```
affordmed/
├── logging_middleware/      Shared logging package (ships logs to evaluation service)
├── backend/                 Node.js + Express + TypeScript API
├── frontend/                React + TypeScript + Material UI
├── notification_system_design.md
└── README.md
```

## Setup

### Step 1 — Build the logging middleware

```bash
cd logging_middleware
npm install
npm run build
```

### Step 2 — Backend

```bash
cd backend
cp .env.example .env
# Fill in LOG_BEARER_TOKEN and EVALUATION_API_TOKEN
npm install
npm run dev
# Runs on http://localhost:5000
```

### Step 3 — Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_LOG_BEARER_TOKEN
npm install
npm run dev
# Runs on http://localhost:3000
```

## API Endpoints

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | `/api/notifications`            | List notifications (page, limit, type)   |
| GET    | `/api/notifications/:id`        | Get single notification                  |
| PATCH  | `/api/notifications/:id/read`   | Mark notification as read                |
| GET    | `/api/priority-inbox`           | Top 10 unread, ranked by priority        |
| GET    | `/health`                       | Health check                             |

### Query Params for GET /api/notifications

| Param               | Type                            | Default |
|---------------------|---------------------------------|---------|
| `page`              | number                          | 1       |
| `limit`             | number                          | 10      |
| `notification_type` | `Event` \| `Result` \| `Placement` | —    |

## Logging Middleware Usage

```ts
import { Log } from 'logging_middleware';

await Log('backend', 'info', 'service', 'Notification service started');
await Log('frontend', 'error', 'api', 'Failed to fetch notifications');
```

## Environment Variables

### Backend `.env`

| Variable               | Description                          |
|------------------------|--------------------------------------|
| `PORT`                 | Server port (default 5000)           |
| `NODE_ENV`             | `development` or `production`        |
| `FRONTEND_ORIGIN`      | CORS allowed origin                  |
| `LOG_BEARER_TOKEN`     | Token for evaluation log service     |
| `EVALUATION_API_TOKEN` | Token for fetching external notifications |

### Frontend `.env`

| Variable                | Description                          |
|-------------------------|--------------------------------------|
| `VITE_API_URL`          | Backend API base URL                 |
| `VITE_LOG_BEARER_TOKEN` | Token for evaluation log service     |

## Technologies

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, TypeScript, Material UI, Vite
- **Logging:** Custom middleware → evaluation service REST API
