# 03 — Backend API

> Related: [01_ARCHITECTURE](./01_ARCHITECTURE.md) · [02_DATABASE_SCHEMA](./02_DATABASE_SCHEMA.md) · [05_BUSINESS_RULES](./05_BUSINESS_RULES.md) · [07_ROLE_PERMISSIONS](./07_ROLE_PERMISSIONS.md)

## 1. Base URL & Versioning

`http://localhost:4000/api/v1`

## 2. Response Format

**Success:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```

**Error format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "cargo_weight exceeds vehicle capacity",
    "fields": { "points_required": "must be a positive integer" }
  }
}
```

## 3. HTTP Status Codes

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Valid JWT, insufficient role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Unique constraint violation (e.g. duplicate department code) |
| 500 | Server Error | Unhandled exception |

## 4. Authentication APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Creates Employee account only (no role selection) |
| POST | `/auth/login` | Public | Returns JWT + user object |
| GET | `/auth/me` | JWT | Returns current user profile |

**Example — POST /auth/login**
Request:
```json
{ "email": "aditi@ecosphere.io", "password": "••••••••" }
```
Response `200`:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid", "name": "Aditi Rao", "role": "EMPLOYEE", "departmentId": "uuid" }
  }
}
```

## 5. CRUD API Pattern (applies to every entity)

Every list module (Departments, Categories, EmissionFactors, CSRActivities, Challenges, Badges, Rewards, Policies, Audits) exposes the same 5 endpoints:

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/{resource}` | supports `?page=&limit=&sort=&search=&status=` |
| GET | `/{resource}/:id` | single record |
| POST | `/{resource}` | RBAC-gated (see [07_ROLE_PERMISSIONS](./07_ROLE_PERMISSIONS.md)) |
| PATCH | `/{resource}/:id` | partial update |
| DELETE | `/{resource}/:id` | soft-status change where applicable, not hard delete |

**Pagination/filtering/search/sort query params:**
```
GET /api/v1/csr-activities?page=1&limit=10&status=ACTIVE&search=tree&sort=-event_date
```

## 6. Full Endpoint List by Module

### Environmental
```
GET/POST            /emission-factors
GET/PATCH/DELETE     /emission-factors/:id
GET/POST            /carbon-transactions
GET                 /carbon-transactions/:id
GET/POST            /environmental-goals
PATCH               /environmental-goals/:id
```

### Social
```
GET/POST            /csr-activities
PATCH/DELETE        /csr-activities/:id
POST                /csr-activities/:id/join          -> creates EmployeeParticipation (PENDING)
GET                 /participations?status=PENDING
PATCH               /participations/:id/approve
PATCH               /participations/:id/reject
GET                 /social/diversity                  -> aggregate headcount by department
```

### Governance
```
GET/POST            /policies
PATCH               /policies/:id
POST                /policies/:id/acknowledge
GET                 /policies/:id/acknowledgements
GET/POST            /audits
PATCH               /audits/:id
POST                /audits/:id/close
GET/POST            /compliance-issues
PATCH               /compliance-issues/:id
```

### Gamification
```
GET/POST            /challenges
PATCH/DELETE        /challenges/:id
POST                /challenges/:id/join
PATCH               /challenge-participations/:id/progress
PATCH               /challenge-participations/:id/approve
GET                 /badges
GET                 /employees/:id/badges
GET/POST            /rewards
POST                /rewards/:id/redeem
GET                 /leaderboard?scope=employee|department
```

### Reports
```
GET  /reports/environmental
GET  /reports/social
GET  /reports/governance
GET  /reports/esg-summary
GET  /reports/custom?department=&dateFrom=&dateTo=&module=&employee=&challenge=&category=   [stretch]
```

### Dashboard
```
GET /dashboard/scores           -> {environmental, social, governance, overall}
GET /dashboard/emissions-trend  -> 12-month series
GET /dashboard/department-ranking
GET /dashboard/recent-activity
```

### Settings
```
GET/POST/PATCH/DELETE   /departments
GET/POST/PATCH/DELETE   /categories
GET/PATCH               /esg-configuration     -> toggles: autoEmissionCalc, evidenceRequired, autoBadgeAward, emailAlerts
GET/PATCH               /notification-settings
```

### Notifications
```
GET   /notifications?unread=true
PATCH /notifications/:id/read
```

## 7. Validation Rules (examples — full list in [05_BUSINESS_RULES](./05_BUSINESS_RULES.md))

| Field | Rule |
|---|---|
| `Department.code` | required, unique, max 20 chars |
| `CarbonTransaction.quantity` | required, must be > 0 |
| `Challenge.xp` | required, integer, > 0 |
| `RewardRedemption` | blocked if `employee.totalPoints < reward.pointsRequired` or `reward.stock <= 0` |
| `ComplianceIssue.dueDate` | required, must be present or future date at creation |
| `EmployeeParticipation.proof` | required if `csrActivity.evidenceRequired === true` and `esgConfig.requireEvidenceForCSR === true` |

## 8. JWT Authentication Middleware

```ts
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new UnauthorizedError());
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new UnauthorizedError());
  }
}
```

## 9. RBAC Middleware

```ts
export function rbac(...allowedRoles: Role[]) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) return next(new ForbiddenError());
    next();
  };
}
// usage: router.post('/departments', authMiddleware, rbac('ADMIN'), controller.create)
```

## 10. Controller / Service / Repository Structure

```
controllers/carbonTransaction.controller.ts   -> parses req, calls service, sends res
services/carbonTransaction.service.ts         -> computes calculatedEmission = quantity * factor.value
repositories/carbonTransaction.repository.ts  -> prisma.carbonTransaction.create(...)
```

## 11. Example Request/Response — Reward Redemption (business-rule-heavy)

**POST /rewards/:id/redeem**
```json
{ "employeeId": "uuid" }
```
Success `200`:
```json
{
  "success": true,
  "data": { "redemption": { "id": "uuid", "pointsSpent": 150 }, "remainingPoints": 350, "rewardStockRemaining": 4 }
}
```
Failure `400` (insufficient points):
```json
{
  "success": false,
  "error": { "code": "INSUFFICIENT_POINTS", "message": "Employee has 90 points; reward requires 150." }
}
```

## 12. Backend Phase 0 Contract Freeze

The authoritative MVP API contract is now `contracts/openapi.yaml`; decisions are recorded in [18_BACKEND_DECISIONS](./18_BACKEND_DECISIONS.md).

Approved changes and clarifications:

- API base path remains `/api/v1`.
- Only API roles are `ADMIN`, `ESG_MANAGER`, `EMPLOYEE`, and `AUDITOR`.
- `SUSTAINABILITY_MANAGER` is not an API enum; the frontend may use "Sustainability Manager" as display text for `ESG_MANAGER`.
- `HR_MANAGER` is not part of the MVP role model.
- Auth endpoints are frozen to `POST /auth/signup`, `POST /auth/login`, and `GET /auth/me`.
- No `/auth/register`, `/auth/refresh`, or `/auth/logout` endpoint exists in MVP.
- Signup returns the created `EMPLOYEE` user without a token; frontend redirects to login.
- Logout is frontend local/session token clearing.
- All success and error responses include `meta.requestId`.
- Field validation errors use `error.fields`.
- Decimal values are serialized as JSON strings.
- Product ESG Profiles, Diversity Snapshots, Training Records, operational-emission ingestion, reward redemption, CSV exports, and protected admin/demo jobs are in the MVP contract.
- Proofs and documents are external HTTP/HTTPS URLs only; multipart upload, local file storage, and base64 upload are deferred.
- PDF and Excel exports are deferred; CSV is the MVP export format.

---
**Next:** [04_FRONTEND_PAGES.md](./04_FRONTEND_PAGES.md)
