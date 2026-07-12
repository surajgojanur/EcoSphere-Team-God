# 18 - Backend Decisions

This document records approved Backend Phase 0 decisions for the EcoSphere MVP API contract. These decisions override older conflicting notes in prior docs until those docs are fully revised.

## Source-of-Truth Order

1. Approved decisions in this document and the Backend Phase 0 task
2. `contracts/openapi.yaml`
3. `docs/05_BUSINESS_RULES.md`
4. `docs/07_ROLE_PERMISSIONS.md`
5. `docs/03_BACKEND_API.md`
6. `docs/02_DATABASE_SCHEMA.md`
7. `docs/04_FRONTEND_PAGES.md`
8. Actual frontend code
9. Actual backend foundation
10. Task-board assumptions

## Approved Decisions

### BACKEND-DECISION-001 - API Roles

- Status: Approved
- Context: Earlier frontend assumptions used `SUSTAINABILITY_MANAGER` and `HR_MANAGER`, while project docs used `ESG_MANAGER`.
- Decision: The only API and database roles are `ADMIN`, `ESG_MANAGER`, `EMPLOYEE`, and `AUDITOR`.
- Consequences: `SUSTAINABILITY_MANAGER` and `HR_MANAGER` are not valid API enum values.
- Frontend impact: Display text may say "Sustainability Manager", but API payloads must use `ESG_MANAGER`.
- Backend impact: Prisma enum, JWT claims, RBAC middleware, OpenAPI schemas, and seeds must use the approved values.
- Future revisit condition: A future HR module explicitly requires a new role and updates the API contract.

### BACKEND-DECISION-002 - Authentication Contract

- Status: Approved
- Context: MVP needs simple JWT auth without refresh-token complexity.
- Decision: Implement only `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, and `GET /api/v1/auth/me`.
- Consequences: No `/auth/register`, `/auth/refresh`, or `/auth/logout` endpoints exist in MVP.
- Frontend impact: Signup redirects to login because signup returns a user without a token. Logout clears the local/session token.
- Backend impact: Login returns a Bearer JWT access token and user; inactive users receive authentication rejection.
- Future revisit condition: Token revocation, SSO, or refresh-token requirements are approved.

### BACKEND-DECISION-003 - API Envelopes

- Status: Approved
- Context: Frontend and backend need a single response shape.
- Decision: Use `success`, `data`, and `meta.requestId` for success responses; paginated responses add `page`, `limit`, `total`, and `totalPages`; errors use `success: false`, `error.code`, `error.message`, optional `error.fields`, and `meta.requestId`.
- Consequences: `error.fields` is the only field-error container.
- Frontend impact: Clients should read `meta.requestId` and `error.fields`.
- Backend impact: Shared response helpers and error middleware must use this envelope.
- Future revisit condition: Public API versioning introduces a new envelope under a new version.

### BACKEND-DECISION-004 - Status Codes

- Status: Approved
- Context: Earlier docs did not fully cover all business conflicts.
- Decision: Use `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, and `500`. Do not use `422` in MVP.
- Consequences: Business validation and invalid transitions return `400`; duplicates, idempotency conflicts, stock races, and uniqueness conflicts return `409`.
- Frontend impact: Error handling should not expect `422`.
- Backend impact: Prisma mapper and application errors must map to approved statuses.
- Future revisit condition: API consumers require a broader HTTP status policy.

### BACKEND-DECISION-005 - Pagination and Serialization

- Status: Approved
- Context: Decimal precision must survive JSON serialization.
- Decision: List endpoints support relevant subsets of `page`, `limit`, `search`, `sortBy`, `sortOrder`, `status`, `departmentId`, `employeeId`, `categoryId`, `dateFrom`, and `dateTo`. Decimal values are JSON strings.
- Consequences: Maximum `limit` is 100. Business dates use `YYYY-MM-DD`; timestamps use UTC ISO 8601.
- Frontend impact: Numeric display components must parse decimal strings deliberately.
- Backend impact: DTO serializers must consistently convert Prisma Decimal values to strings.
- Future revisit condition: A typed generated client handles decimals differently.

### BACKEND-DECISION-006 - Model Inventory

- Status: Approved
- Context: The old schema doc omitted required official MVP entities.
- Decision: Future Prisma schema must include `SystemStatus`, `User`, `Department`, `Category`, `EmissionFactor`, `ProductESGProfile`, `OperationalEmissionEvent`, `CarbonTransaction`, `EnvironmentalGoal`, `CSRActivity`, `EmployeeParticipation`, `DiversitySnapshot`, `TrainingRecord`, `Challenge`, `ChallengeParticipation`, `Badge`, `EmployeeBadge`, `Reward`, `RewardRedemption`, `ESGPolicy`, `PolicyAcknowledgement`, `Audit`, `ComplianceIssue`, `DepartmentScore`, `ESGConfiguration`, `NotificationSetting`, `Notification`, and `ActivityLog`.
- Consequences: Product ESG Profiles, diversity, and training are MVP contract items.
- Frontend impact: Future pages can rely on stable endpoint groups.
- Backend impact: Schema implementation must preserve the existing `SystemStatus` model and add a separate domain migration.
- Future revisit condition: A scoped MVP reduction is approved by the team.

### BACKEND-DECISION-007 - Points, XP, Badges, and Rewards

- Status: Approved
- Context: Prior docs blurred XP and redeemable points.
- Decision: CSR approvals award `POINTS`; challenge approvals award `XP`; balances are independent; each reward consumes either `POINTS` or `XP`.
- Consequences: Rewards store currency and cost snapshots; redemption is mandatory in MVP.
- Frontend impact: Reward UI must display currency and cannot assume all rewards consume points.
- Backend impact: Balance calculations, reward redemption, and leaderboard metrics must separate `POINTS` and `XP`.
- Future revisit condition: Product decides rewards should use only one balance.

### BACKEND-DECISION-008 - Operational Emissions

- Status: Approved
- Context: Official requirements include automatic emission calculation, but not full Odoo integration.
- Decision: Provide narrow operational-emission preview and ingestion routes for `PURCHASE`, `MANUFACTURING`, `EXPENSE`, `FLEET`, `UTILITY`, and `OTHER`.
- Consequences: The backend fetches factors, calculates emissions, snapshots factors/units, and uses `sourceSystem + externalReference` as the idempotency key.
- Frontend impact: Clients must never submit authoritative `calculatedEmission`.
- Backend impact: Ingestion creates `OperationalEmissionEvent` and `CarbonTransaction` atomically.
- Future revisit condition: A full ERP/Odoo sync design is approved.

### BACKEND-DECISION-009 - Proof, Documents, and Exports

- Status: Approved
- Context: Upload infrastructure is not part of Phase 0.
- Decision: MVP proof and document fields are external HTTP/HTTPS URLs. No multipart upload, local file storage, or base64 upload is supported. Reports return JSON and CSV only.
- Consequences: PDF and Excel exports are deferred.
- Frontend impact: Forms should collect URLs for proofs, documents, certificates, badge icons, reward images, and product references.
- Backend impact: URL validation must reject unsupported schemes and overly long values.
- Future revisit condition: Object storage or upload service is approved.

### BACKEND-DECISION-010 - Score Formulas

- Status: Approved
- Context: The official problem statement did not define all sub-score formulas.
- Decision: Use the formulas documented in `docs/05_BUSINESS_RULES.md` as approved MVP assumptions with explicit edge behavior.
- Consequences: Environmental with no applicable goals is `0` and `hasData=false`; Social with no active employees is `0` and `hasData=false`; Governance with no compliance issues is `100` and `hasData=true`.
- Frontend impact: Dashboard should show `hasData` states and not treat every `0` as failure.
- Backend impact: Scores are clamped to 0-100, rounded to two decimals, stored once per department per business date, and overall score is weighted by active employee count.
- Future revisit condition: The team replaces the MVP formulas with official scoring rules.

### BACKEND-DECISION-011 - Compliance and Admin Jobs

- Status: Approved
- Context: The MVP needs deterministic side effects without claiming a distributed queue exists.
- Decision: `isOverdue` is backend-authoritative. Protected admin job endpoints exist for recomputing overdue issues, recomputing scores, and sending policy reminders.
- Consequences: Repeated runs must be idempotent and avoid duplicate uncontrolled notifications.
- Frontend impact: UI consumes server `isOverdue`.
- Backend impact: Future services must write notifications and activity logs for transitions.
- Future revisit condition: A scheduler or queue is introduced behind an explicit architecture decision.

## Frontend Reconciliation Required

- API enum is `ESG_MANAGER`.
- "Sustainability Manager" is display text only.
- `HR_MANAGER` is not in the MVP.
- Signup endpoint is `/api/v1/auth/signup`.
- Signup returns user without token.
- Frontend redirects to login after signup.
- Login returns token and user.
- No refresh endpoint exists.
- No server logout endpoint exists.
- Frontend clears the local/session token on logout.
- Authentication uses a Bearer token.
- Decimal fields arrive as strings.
- Validation errors use `error.fields`.
- Request ID is `meta.requestId`.
- Reward currency is `POINTS` or `XP`.
- Product ESG Profile APIs exist.
- Operational-emission APIs exist.
- Proofs/documents use URL inputs.
- CSV is the MVP export format.

## Deferred Features

- `/auth/register`, `/auth/refresh`, and `/auth/logout`
- HR-specific role model
- Multipart uploads, local file storage, and base64 uploads
- PDF and Excel report exports
- Policy versioning
- Distributed queue infrastructure
- Full Odoo synchronization
