# 01 — Architecture

> Related: [00_PROJECT_OVERVIEW](./00_PROJECT_OVERVIEW.md) · [02_DATABASE_SCHEMA](./02_DATABASE_SCHEMA.md) · [03_BACKEND_API](./03_BACKEND_API.md)

## 1. System Architecture (High Level)

```mermaid
flowchart TB
    subgraph Client
        A[React SPA - Tailwind]
    end
    subgraph API["Backend - Node/Express"]
        B[REST API Layer]
        C[Middleware: Auth, RBAC, Validation]
        D[Controller Layer]
        E[Service Layer]
        F[Repository Layer - Prisma]
    end
    subgraph Data
        G[(PostgreSQL)]
    end
    A -->|HTTPS/JSON| B
    B --> C --> D --> E --> F --> G
```

## 2. Layered Architecture

| Layer | Responsibility | Never Does |
|---|---|---|
| Controller | Parse request, call service, shape response | Business logic, DB queries |
| Service | Business rules, score calculation, orchestration | Direct Prisma calls (uses Repository) |
| Repository | Prisma queries only | Business logic |
| Middleware | Auth verification, role check, request validation (zod/joi) | Business logic |

## 3. Frontend Architecture

```mermaid
flowchart LR
    Pages --> Components
    Pages --> Hooks
    Hooks --> API["api/ (axios client)"]
    Pages --> Store["store/ (auth + user context)"]
```

- **Pages**: one per route (`/dashboard`, `/environmental`, `/social`, `/governance`, `/gamification`, `/reports`, `/settings`)
- **Components**: shared — `ScoreCard`, `DataTable`, `StatusBadge`, `ChallengeCard`, `ApprovalQueue`
- **Hooks**: `useAuth`, `useFetch`, `useRole`
- **Store**: React Context for authenticated user + role (no Redux needed at this scope)

## 4. Backend Architecture

```mermaid
flowchart TB
    Router --> MW1[authMiddleware]
    MW1 --> MW2[rbacMiddleware]
    MW2 --> MW3[validationMiddleware]
    MW3 --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Prisma[(Prisma Client)]
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL

    U->>F: Enter email/password
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User record (hashed password)
    B->>B: bcrypt.compare(password, hash)
    alt valid
        B->>B: sign JWT {userId, role}
        B-->>F: 200 {token, user}
        F->>F: Store token, redirect to Dashboard
    else invalid
        B-->>F: 401 Invalid credentials
    end
```

## 6. RBAC Model

- JWT payload: `{ userId, role, departmentId }`
- `rbacMiddleware(allowedRoles: Role[])` checks `req.user.role` against route's allowed list
- Full matrix: [07_ROLE_PERMISSIONS.md](./07_ROLE_PERMISSIONS.md)

```mermaid
flowchart LR
    Req[Incoming Request] --> Auth{JWT valid?}
    Auth -- no --> R401[401 Unauthorized]
    Auth -- yes --> Role{Role allowed for route?}
    Role -- no --> R403[403 Forbidden]
    Role -- yes --> Handler[Controller executes]
```

## 7. Folder Structure

See [00_PROJECT_OVERVIEW.md §9](./00_PROJECT_OVERVIEW.md#9-repository-structure).

## 8. Dependency Graph (Module Build Order)

```mermaid
flowchart TB
    Auth --> Departments
    Departments --> Categories
    Categories --> Environmental
    Categories --> Social
    Categories --> Gamification
    Departments --> Governance
    Environmental --> ScoreEngine
    Social --> ScoreEngine
    Governance --> ScoreEngine
    ScoreEngine --> Dashboard
    ScoreEngine --> Reports
```

**Implication:** Auth and Departments/Categories must be built first (Hour 1) — every other module depends on them. See [09_TEAM_ASSIGNMENTS.md](./09_TEAM_ASSIGNMENTS.md).

## 9. Request Flow (Example: Approve CSR Participation)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as API
    participant Svc as ParticipationService
    participant Repo as Repository
    participant Badge as BadgeService

    FE->>API: PATCH /participations/:id/approve
    API->>Svc: approveParticipation(id)
    Svc->>Repo: update status=Approved, points=X
    Svc->>Badge: checkBadgeUnlock(employeeId)
    Badge->>Repo: fetch employee XP + completed count
    Badge->>Repo: if rule met, insert EmployeeBadge
    Svc-->>API: updated participation + badge (if any)
    API-->>FE: 200 {participation, badgeAwarded}
```

## 10. Error Flow

```mermaid
flowchart LR
    Err[Error thrown in Service] --> Handler[errorMiddleware]
    Handler --> Classify{Type?}
    Classify -- ValidationError --> R400[400 + field errors]
    Classify -- NotFoundError --> R404[404]
    Classify -- ForbiddenError --> R403[403]
    Classify -- Unhandled --> R500[500 + logged]
```

All errors flow through a single Express error-handling middleware — no controller sends raw try/catch error responses. Format: [03_BACKEND_API.md#error-format](./03_BACKEND_API.md#error-format).

## 11. Logging Flow

- Request logger (morgan or pino) at the top of the middleware chain — logs method, path, status, duration
- Business-significant actions (approval, score recalculation, badge award) additionally write to `ActivityLog` table for the Activity Logs / audit trail requirement

## 12. Notification Flow

```mermaid
sequenceDiagram
    participant Svc as Any Service
    participant Notif as NotificationService
    participant DB as Database
    participant FE as Frontend

    Svc->>Notif: notify(userId, type, message)
    Notif->>DB: insert Notification row
    FE->>API: GET /notifications (poll or on load)
    API-->>FE: unread notifications
```

Triggers: compliance issue raised, CSR/Challenge approval decision, policy acknowledgement reminder, badge unlock — per [05_BUSINESS_RULES.md#notification-rules](./05_BUSINESS_RULES.md#notification-rules).

---
**Next:** [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md)

## Backend MVP Implementation Note

The backend implementation uses Express 5, TypeScript ESM, Prisma/PostgreSQL, Zod validation, Bearer JWT authentication, route-level RBAC, request IDs, response envelopes, and centralized Prisma/error normalization.
