# 08 — Task Board

> Related: [09_TEAM_ASSIGNMENTS](./09_TEAM_ASSIGNMENTS.md) · [00_PROJECT_OVERVIEW §16 Scope](./00_PROJECT_OVERVIEW.md#16-scope-mvp--build-in-8-hours)
> Rule: never delete a completed task. Change `- [ ]` to `- [x]` only.
> Column key: 🔴 To Do · 🟡 In Progress · 🟢 Done

## Backlog Legend

| Priority | Meaning |
|---|---|
| P0 | Blocks other developers — do first |
| P1 | MVP-critical |
| P2 | MVP-nice-to-have, cut if behind schedule |
| P3 | Out of scope for 8hrs — do not start unless everything else is done |

---

## 🔴 To Do

### SETUP-01 — Repo + Docker Compose + Prisma init
- **Priority**: P0 · **Owner**: Dev 1 · **Dependencies**: none · **Estimate**: 30 min
- Checklist:
  - [ ] `docker-compose.yml` with postgres + backend + frontend services
  - [ ] `backend/prisma/schema.prisma` committed (all 20 models from [02_DATABASE_SCHEMA](./02_DATABASE_SCHEMA.md))
  - [ ] `npx prisma migrate dev` runs clean
  - [ ] `.env.example` committed
- **Acceptance Criteria**: all 4 devs can `docker compose up` and hit `localhost:4000/health` → 200

### SETUP-00 — Docker development baseline
- **Priority**: P0 · **Owner**: Dev 1 · **Dependencies**: none · **Estimate**: 45 min
- Checklist:
  - [x] Create frontend Dockerfile
  - [x] Create backend Dockerfile
  - [x] Configure PostgreSQL service
  - [x] Add persistent database volume
  - [x] Add service health checks
  - [x] Add environment variable template
  - [x] Add backend `/health` endpoint
  - [x] Add backend `/ready` endpoint with real database query
  - [x] Add minimal frontend backend-status page
  - [x] Keep host `node_modules` out of containers
  - [x] Document startup and reset commands
  - [x] Verify local backend test/typecheck/build scripts
  - [x] Verify local frontend test/typecheck/build scripts
  - [x] Validate Docker Compose on a machine with Docker installed
  - [x] Verify frontend-to-backend connectivity through browser
  - [x] Verify backend-to-database connectivity through running container
  - [ ] Verify setup on Apple Silicon macOS
  - [ ] Verify setup on Intel macOS
  - [x] Verify setup on Fedora with SELinux enforcing
- **Acceptance Criteria**: from a clean clone, `cp .env.example .env && docker compose up --build` starts `db`, `backend`, and `frontend`; frontend is reachable at `localhost:3000`; backend `/health` returns 200; backend `/ready` confirms PostgreSQL connectivity; PostgreSQL data persists in the `postgres_data` named volume.

### AUTH-01 — Signup/Login API + JWT middleware
- **Priority**: P0 · **Owner**: Dev 1 · **Dependencies**: SETUP-01 · **Estimate**: 45 min
- Checklist:
  - [ ] `POST /auth/signup` (role forced to EMPLOYEE)
  - [ ] `POST /auth/login` (bcrypt compare, JWT sign)
  - [ ] `authMiddleware`
  - [ ] `rbac(...)` middleware factory
- **Acceptance Criteria**: Postman collection shows 200 on valid login, 401 on invalid, 403 on wrong-role protected route

### AUTH-02 — Login/Signup pages + Auth context
- **Priority**: P0 · **Owner**: Dev 4 · **Dependencies**: AUTH-01 · **Estimate**: 45 min
- Checklist:
  - [ ] `useAuth` hook + Context
  - [ ] Login page per [04_FRONTEND_PAGES](./04_FRONTEND_PAGES.md#page-login--signup)
  - [ ] `ProtectedRoute` wrapper
- **Acceptance Criteria**: unauthenticated user redirected to `/login`; successful login lands on `/dashboard`

### SETTINGS-01 — Departments + Categories CRUD API
- **Priority**: P0 · **Owner**: Dev 1 · **Dependencies**: AUTH-01 · **Estimate**: 45 min
- Checklist:
  - [ ] Department CRUD, unique code validation, cycle check on parent
  - [ ] Category CRUD
  - [ ] Seed script populated
- **Acceptance Criteria**: matches [05_BUSINESS_RULES §2](./05_BUSINESS_RULES.md#2-validation-rules)

### ENV-01 — Emission Factors + Carbon Transactions API
- **Priority**: P1 · **Owner**: Dev 2 · **Dependencies**: SETTINGS-01 · **Estimate**: 1h
- Checklist:
  - [ ] Emission Factor CRUD
  - [ ] Carbon Transaction create with server-side `calculatedEmission`
  - [ ] Carbon Transaction list with department/date filters
- **Acceptance Criteria**: creating a transaction with quantity=10, factor=2.5 returns calculatedEmission=25

### ENV-02 — Environmental Goals API
- **Priority**: P1 · **Owner**: Dev 2 · **Dependencies**: ENV-01 · **Estimate**: 30 min
- Checklist:
  - [ ] Goal CRUD
  - [ ] Progress percentage computed on read
- **Acceptance Criteria**: goal with target=500, current=390 returns progress=78

### SOCIAL-01 — CSR Activities + Participation API
- **Priority**: P1 · **Owner**: Dev 2 · **Dependencies**: SETTINGS-01 · **Estimate**: 1h
- Checklist:
  - [ ] CSR Activity CRUD
  - [ ] Join endpoint (creates Pending participation)
  - [ ] Approve/Reject endpoints with evidence check
  - [ ] Badge-check hook fires on approval
- **Acceptance Criteria**: approving a participation without required proof returns 400

### GOV-01 — Policies + Acknowledgements API
- **Priority**: P1 · **Owner**: Dev 1 · **Dependencies**: SETTINGS-01 · **Estimate**: 30 min
- Checklist:
  - [ ] Policy CRUD
  - [ ] Acknowledge endpoint (unique constraint enforced)
- **Acceptance Criteria**: double-acknowledge is a no-op, not an error

### GOV-02 — Audits + Compliance Issues API
- **Priority**: P1 · **Owner**: Dev 1 · **Dependencies**: GOV-01 · **Estimate**: 1h
- Checklist:
  - [ ] Audit CRUD + close endpoint
  - [ ] Compliance Issue CRUD (owner + dueDate mandatory)
  - [ ] Nightly cron stub for `is_overdue` flag (can run on-demand for demo)
- **Acceptance Criteria**: issue creation without owner or dueDate returns 400

### GAME-01 — Challenges + Challenge Participation API
- **Priority**: P1 · **Owner**: Dev 3 · **Dependencies**: SETTINGS-01 · **Estimate**: 1h
- Checklist:
  - [ ] Challenge CRUD with state machine per [05_BUSINESS_RULES §3](./05_BUSINESS_RULES.md#challenge-lifecycle)
  - [ ] Join / progress update / approve endpoints
- **Acceptance Criteria**: join blocked on non-Active challenge (400)

### GAME-02 — Badges + auto-award engine
- **Priority**: P1 · **Owner**: Dev 3 · **Dependencies**: GAME-01, SOCIAL-01 · **Estimate**: 1h
- Checklist:
  - [ ] Badge CRUD
  - [ ] `BadgeService.checkUnlock(employeeId)` per [06_WORKFLOWS §6](./06_WORKFLOWS.md#6-badge-assignment-auto)
  - [ ] Hooked into participation/challenge approval flows
- **Acceptance Criteria**: employee crossing XP threshold gets `EmployeeBadge` row + notification within same request

### GAME-03 — Rewards + Redemption + Leaderboard API
- **Priority**: P1 · **Owner**: Dev 3 · **Dependencies**: GAME-02 · **Estimate**: 45 min
- Checklist:
  - [ ] Reward CRUD
  - [ ] Redeem endpoint, atomic stock decrement
  - [ ] Leaderboard query (employee + department scope)
- **Acceptance Criteria**: concurrent redemption of last-stock item — one succeeds, one gets 409/400

### SCORE-01 — Score Calculation Engine
- **Priority**: P0 (blocks Dashboard/Reports) · **Owner**: Dev 2 · **Dependencies**: ENV-02, SOCIAL-01, GOV-02 · **Estimate**: 1h
- Checklist:
  - [ ] Implement formulas from [05_BUSINESS_RULES §1](./05_BUSINESS_RULES.md#1-score-calculation-the-single-most-important-derived-rule--locked-before-coding)
  - [ ] `DepartmentScore` write, one row per department per day
  - [ ] Org-level Overall Score aggregation
- **Acceptance Criteria**: manually seed known transactions/issues, verify computed score matches hand-calculated value

### DASH-01 — Dashboard API
- **Priority**: P1 · **Owner**: Dev 2 · **Dependencies**: SCORE-01 · **Estimate**: 30 min
- Checklist:
  - [ ] `/dashboard/scores`, `/dashboard/emissions-trend`, `/dashboard/department-ranking`, `/dashboard/recent-activity`
- **Acceptance Criteria**: response shapes match [04_FRONTEND_PAGES](./04_FRONTEND_PAGES.md#page-dashboard-dashboard)

### FE-01 — App shell, sidebar, top tab nav, layout
- **Priority**: P0 · **Owner**: Dev 4 · **Dependencies**: AUTH-02 · **Estimate**: 45 min
- Checklist:
  - [ ] Sidebar matching wireframe sections
  - [ ] Top module tab strip
  - [ ] `ProtectedRoute`, `RequireRole`
- **Acceptance Criteria**: navigation matches wireframe screen 1

### FE-02 — Dashboard page
- **Priority**: P1 · **Owner**: Dev 4 · **Dependencies**: FE-01, DASH-01 · **Estimate**: 1h
- Checklist:
  - [ ] 4 `ScoreCard`s, `LineChart`, `BarChart`, `ActivityFeed`, Quick Actions
- **Acceptance Criteria**: pixel-reasonable match to wireframe screen 1

### FE-03 — Environmental page
- **Priority**: P1 · **Owner**: Dev 4 · **Dependencies**: FE-01, ENV-01, ENV-02 · **Estimate**: 1h

### FE-04 — Social page
- **Priority**: P1 · **Owner**: Dev 4 · **Dependencies**: FE-01, SOCIAL-01 · **Estimate**: 1h

### FE-05 — Governance page
- **Priority**: P1 · **Owner**: Dev 3 (swap in after GAME tasks) · **Dependencies**: FE-01, GOV-01, GOV-02 · **Estimate**: 1h

### FE-06 — Gamification page
- **Priority**: P1 · **Owner**: Dev 3 · **Dependencies**: FE-01, GAME-01/02/03 · **Estimate**: 1h15m

### FE-07 — Reports page (4 fixed reports)
- **Priority**: P1 · **Owner**: Dev 4 · **Dependencies**: SCORE-01 · **Estimate**: 45 min

### FE-08 — Settings page
- **Priority**: P2 · **Owner**: Dev 1 · **Dependencies**: SETTINGS-01 · **Estimate**: 45 min

### NOTIF-01 — Notification list API + bell dropdown UI
- **Priority**: P2 · **Owner**: Dev 3 / Dev 4 · **Dependencies**: GAME-02, SOCIAL-01, GOV-02 · **Estimate**: 30 min

### CUSTOM-REPORT-01 — Custom Report Builder
- **Priority**: P3 (out of scope, see [00_PROJECT_OVERVIEW §17](./00_PROJECT_OVERVIEW.md#17-out-of-scope-explicitly-cut--mention-in-pitch-do-not-build)) · **Owner**: unassigned

### AUTO-EMISSION-01 — Auto emission calc from Purchase/Fleet
- **Priority**: P3 (out of scope) · **Owner**: unassigned

---

## 🟡 In Progress
*(move tasks here as work starts — keep checklist items intact)*

## 🟢 Done
*(move completed tasks here; all checklist items should be `[x]`)*

---
**Next:** [09_TEAM_ASSIGNMENTS.md](./09_TEAM_ASSIGNMENTS.md)
