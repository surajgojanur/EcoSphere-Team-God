# 12 — Deployment

> Related: [00_PROJECT_OVERVIEW §8 Tech Stack](./00_PROJECT_OVERVIEW.md#8-technology-stack)

## 1. Docker Architecture

```mermaid
flowchart TB
    subgraph Docker Network
        FE[frontend:3000]
        BE[backend:4000]
        DB[(postgres:5432)]
    end
    Browser --> FE
    FE --> BE
    BE --> DB
```

## 2. docker-compose.yml

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ecosphere
      POSTGRES_PASSWORD: ecosphere
      POSTGRES_DB: ecosphere
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://ecosphere:ecosphere@postgres:5432/ecosphere
      JWT_SECRET: change-me-in-real-env
      PORT: 4000
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:4000/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  pgdata:
```

## 3. Environment Variables

| Variable | Where | Example |
|---|---|---|
| `DATABASE_URL` | backend | `postgresql://ecosphere:ecosphere@postgres:5432/ecosphere` |
| `JWT_SECRET` | backend | random 32+ char string |
| `PORT` | backend | `4000` |
| `VITE_API_URL` | frontend | `http://localhost:4000/api/v1` |

`.env.example` committed for both `backend/` and `frontend/`; actual `.env` gitignored.

## 4. PostgreSQL Setup

Handled entirely by the `postgres` service above — no manual install needed. On first `docker compose up`, run:
```bash
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma db seed
```

## 5. Frontend Container (Dockerfile)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
```

## 6. Backend Container (Dockerfile)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]
```

## 7. Networking

All three services share Docker Compose's default bridge network — services reach each other by service name (`postgres`, `backend`) as hostnames.

## 8. Volumes

- `pgdata` — persists Postgres data across container restarts (important: don't `docker compose down -v` mid-hackathon or you lose seed data)
- Bind mounts on `backend`/`frontend` for live code reload during development

## 9. Production Build (post-hackathon / demo-day-morning)

```bash
docker compose -f docker-compose.prod.yml up --build
```
- Frontend: `npm run build` → served via nginx or `vite preview`
- Backend: `npm run build` → `node dist/app.js`, no live-reload volumes

## 10. Development Build (used during the hackathon)

```bash
docker compose up --build
```
Live reload on both frontend and backend via bind-mounted volumes — this is the only build config you need during the 8 hours.

## 11. Quick Start (put in root README.md)

```bash
git clone <repo>
cd ecosphere
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma db seed
# visit http://localhost:3000
```

---
**Next:** [13_TESTING_CHECKLIST.md](./13_TESTING_CHECKLIST.md)
