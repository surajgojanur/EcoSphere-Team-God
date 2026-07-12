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

Refresh dependency volumes after lockfile changes:

```bash
# When frontend/package-lock.json changes
docker compose run --rm frontend npm ci
docker compose restart frontend

# When backend/package-lock.json changes
docker compose run --rm backend npm ci
docker compose restart backend
```

The Compose setup uses named `node_modules` volumes. Those volumes can retain
older dependencies even after a lockfile changes. The commands above refresh
only the dependency volume for the affected service and keep PostgreSQL data
intact.

Reset local database data only when you deliberately want to delete it:

```bash
docker compose down -v
```

`docker compose down -v` removes the named PostgreSQL volume and deletes local
development database data. Do not use it for routine dependency refresh.

## Development Baseline

The current baseline provides:

- React + Vite + Tailwind frontend on port `3000`
- Node.js + Express + TypeScript backend on port `4000`
- PostgreSQL 16 database on port `5432`
- Prisma migration/client generation inside the backend container
- `/health` process check and `/ready` database connectivity check
- Docker Compose health checks, service dependencies, named volumes, and hot reload

No ESG business modules are implemented in this foundation task.
