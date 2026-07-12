# EcoSphere Team God

EcoSphere is an ESG Management Platform for an 8-hour Odoo hiring hackathon.
The `/docs` directory is the source of truth for architecture, scope, business
rules, workflows, testing, and team execution.

## Quick Start

Prerequisites:

- Git
- Docker
- Docker Compose plugin

Start the full development stack from a clean clone:

```bash
git clone <repository-url>
cd EcoSphere-Team-God
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health
- Backend readiness: http://localhost:4000/ready

Useful commands:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

Reset local database data only when you deliberately want to delete it:

```bash
docker compose down -v
```

`docker compose down -v` removes the named PostgreSQL volume and deletes local
development database data.

## Development Baseline

The current baseline provides:

- React + Vite + Tailwind frontend on port `3000`
- Node.js + Express + TypeScript backend on port `4000`
- PostgreSQL 16 database on port `5432`
- Prisma migration/client generation inside the backend container
- `/health` process check and `/ready` database connectivity check
- Docker Compose health checks, service dependencies, named volumes, and hot reload

No ESG business modules are implemented in this foundation task.
