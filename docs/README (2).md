# EcoSphere — Backend

Node + Express + TypeScript + Prisma + PostgreSQL. Implements the API contract in `docs/03_BACKEND_API.md` and enforces every rule in `docs/05_BUSINESS_RULES.md` server-side.

## Quick start

```bash
cd backend
cp .env.example .env          # set DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                   # http://localhost:4000/api/v1
```

With Docker Compose from the repo root, run migrate + seed inside the container:
```bash
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run seed
```

## Seeded accounts (password: `password123`)

| Email | Role | Notes |
|---|---|---|
| admin@ecosphere.io | ADMIN | Settings, ESG config, user roles |
| manager@ecosphere.io | ESG_MANAGER | Approvals, audits, reports |
| auditor@ecosphere.io | AUDITOR | Audits + compliance issues |
| aditi@ecosphere.io | EMPLOYEE | Has a **PENDING** Tree Plantation submission — approve it live in the demo to trigger the badge engine |
| karan@ecosphere.io | EMPLOYEE | 230 XP, top of leaderboard |
| priya@ecosphere.io | EMPLOYEE | Owns a compliance issue |
| rohit@ecosphere.io | EMPLOYEE | No participation — keeps Social score realistically below 100% |

## Architecture

```
src/
├── config/prisma.ts             Prisma client singleton
├── middleware/
│   ├── auth.ts                  authMiddleware + rbac(...roles)
│   ├── validate.ts              zod body validation -> 400 with field errors
│   └── error.ts                 single error handler (AppError, Prisma P2002/P2025, 500)
├── services/
│   ├── score.service.ts         ⭐ ESG score engine (Business Rules §1)
│   ├── badge.service.ts         ⭐ auto-award engine + unlock-rule parser
│   ├── points.service.ts        XP / available-points balance
│   ├── notification.service.ts
│   └── activityLog.service.ts
├── routes/                      one file per module
└── utils/
    ├── crudFactory.ts           generic CRUD (list/get/create/update/delete) w/ pagination+search+RBAC
    ├── errors.ts                AppError + BadRequest/Unauthorized/Forbidden/NotFound/Conflict
    └── response.ts              { success, data, meta } envelope + asyncHandler
```

`crudFactory.ts` is why this is ~9 modules of CRUD without 9 copies of the same code. Modules with real business logic (carbon transactions, participations, challenges, rewards) define their custom endpoints explicitly on top of it.

## Endpoints

All under `/api/v1`. All except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Roles |
|---|---|---|
| POST | `/auth/signup` | public — **always creates EMPLOYEE**, role is never read from the body |
| POST | `/auth/login` | public |
| GET | `/auth/me` | any |

### Master data
| Method | Path | Roles |
|---|---|---|
| GET/POST/PATCH/DELETE | `/departments` | read: any · write: ADMIN |
| GET/POST/PATCH/DELETE | `/categories` | read: any · write: ADMIN |
| GET/POST/PATCH | `/users` | ADMIN — the only place a non-EMPLOYEE role can be assigned |
| GET/PATCH | `/esg-configuration` | read: any · write: ADMIN (weights must sum to 1.0) |

### Environmental
| Method | Path | Roles |
|---|---|---|
| GET/POST/PATCH/DELETE | `/emission-factors` | write: ADMIN, ESG_MANAGER |
| GET/POST | `/carbon-transactions` | create: any authed — `calculatedEmission` computed **server-side** |
| GET/POST/PATCH/DELETE | `/environmental-goals` | write: ADMIN, ESG_MANAGER — returns `progressPercent` |

### Social
| Method | Path | Roles |
|---|---|---|
| GET/POST/PATCH/DELETE | `/csr-activities` | write: ADMIN, ESG_MANAGER |
| POST | `/csr-activities/:id/join` | EMPLOYEE — ACTIVE activities only, one join per employee |
| GET | `/participations?status=PENDING` | employees see only their own |
| PATCH | `/participations/:id/approve` | ADMIN, ESG_MANAGER — **blocked without proof if evidence required**; awards points → fires badge engine |
| PATCH | `/participations/:id/reject` | ADMIN, ESG_MANAGER |
| GET | `/social/diversity` | any |

### Governance
| Method | Path | Roles |
|---|---|---|
| GET/POST/PATCH/DELETE | `/policies` | write: ADMIN, ESG_MANAGER |
| POST | `/policies/:id/publish` | notifies every employee |
| POST | `/policies/:id/acknowledge` | EMPLOYEE — **idempotent**, repeat click is a no-op |
| GET | `/policies/:id/acknowledgements` | returns `{ acknowledged, totalEmployees, percent }` |
| GET/POST/PATCH/DELETE | `/audits` | ADMIN, ESG_MANAGER, AUDITOR |
| POST | `/audits/:id/close` | auditors can only close **their own** audits |
| GET/POST/PATCH | `/compliance-issues` | **owner + dueDate mandatory**; employees see/edit only issues they own |

### Gamification
| Method | Path | Roles |
|---|---|---|
| GET/POST/PATCH/DELETE | `/challenges` | write: ADMIN, ESG_MANAGER |
| PATCH | `/challenges/:id/status` | enforces the state machine — illegal transitions return 400 |
| POST | `/challenges/:id/join` | EMPLOYEE — ACTIVE + not past deadline |
| GET | `/challenge-participations` | employees see only their own |
| PATCH | `/challenge-participations/:id/progress` | own record only |
| PATCH | `/challenge-participations/:id/approve` \| `/reject` | ADMIN, ESG_MANAGER — approve fires badge engine |
| GET/POST/PATCH/DELETE | `/badges` | `unlockRule` is regex-validated on write |
| GET | `/badges/employee/:employeeId` | earned + locked + current metrics |
| GET/POST/PATCH/DELETE | `/rewards` | write: ADMIN, ESG_MANAGER |
| POST | `/rewards/:id/redeem` | EMPLOYEE — **atomic stock decrement**, `INSUFFICIENT_POINTS` / `OUT_OF_STOCK` |
| GET | `/leaderboard?scope=employee\|department` | any |
| GET | `/leaderboard/me/points` | current user's XP + available points |

### Dashboard / Reports / Notifications
| Method | Path | Roles |
|---|---|---|
| GET | `/dashboard/scores` | 4 headline scores (lazily recomputes if stale) |
| GET | `/dashboard/emissions-trend?months=12` | monthly buckets for the line chart |
| GET | `/dashboard/department-ranking` | ranked bar-chart data |
| GET | `/dashboard/recent-activity` | activity feed |
| GET | `/dashboard/kpis` | pending approvals, open/overdue issues, active challenges |
| POST | `/dashboard/recompute` | ADMIN, ESG_MANAGER — **use this in the demo** to flag overdue issues + rescore on command |
| GET | `/reports/environmental` \| `/social` \| `/governance` \| `/esg-summary` | ADMIN, ESG_MANAGER, AUDITOR |
| GET | `/notifications?unread=true` · PATCH `/notifications/:id/read` | own only |

## The rules that are actually enforced (not just documented)

1. **No self-elevation** — `/auth/signup` hardcodes `role: 'EMPLOYEE'`. Sending `"role": "ADMIN"` in the body does nothing.
2. **Emissions computed server-side** — the client sends `quantity`; the server multiplies by the factor. A tampered `calculatedEmission` in the body is ignored.
3. **Evidence gate** — approval is rejected with 400 if the activity requires evidence (and the config toggle is on) but no proof is attached.
4. **Reward race condition** — stock decrement is `updateMany({ where: { id, stock: { gt: 0 } } })`, a single atomic statement. Two concurrent redemptions of the last unit: one gets 200, the other gets `OUT_OF_STOCK`. A read-then-write would let both through.
5. **Challenge state machine** — `ALLOWED_TRANSITIONS` map in `gamification.routes.ts`. `COMPLETED` and `ARCHIVED` are terminal; anything else → 400.
6. **Compliance owner + due date** — mandatory in the zod schema, so it's a 400 before it ever reaches the DB.
7. **Department cycles** — a middleware walks the parent chain before create/update and rejects a cycle.
8. **Idempotent acknowledgement** — `upsert` with an empty `update`, so a double-click is a no-op rather than a 409.

## Score formula (the one thing the PDF left undefined)

Implemented in `services/score.service.ts`:
- **Environmental** = mean progress across the department's non-completed goals, clamped 0–100
- **Social** = % of the department's active employees with ≥1 approved CSR *or* challenge participation
- **Governance** = `100 − (severity-weighted OPEN issues ÷ severity-weighted total issues × 100)`, weights High=3 / Medium=2 / Low=1
- **Department total** = `E×0.4 + S×0.3 + G×0.3` (weights live in `ESGConfiguration`, validated to sum to 1.0)
- **Overall org score** = department totals weighted by **headcount**, so a 3-person team doesn't move the org score as much as a 300-person one

Empty-state defaults: no goals → Environmental 100, no issues → Governance 100 (nothing is off-track), no employees → Social 0.

## Known gaps (deliberately out of MVP scope)

- Auto emission calculation from Purchase/Fleet records — the `autoEmissionCalc` toggle exists but only manual entry is wired
- Custom Report Builder — the 4 fixed reports are implemented; the filter-combination builder is not
- File upload — `proofUrl` accepts a string; there's no multipart upload endpoint yet
- CSV/PDF export — report endpoints return JSON; format it on the frontend
- The nightly job is a `setInterval` in `server.ts`, not a real cron/queue. `POST /dashboard/recompute` is the manual trigger for the demo.
