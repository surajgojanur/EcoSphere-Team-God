# EcoSphere API Changelog

## 2026-07-12 - Backend MVP Implementation

- Implemented persisted backend handlers for the accepted non-deferred MVP routes without changing auth paths, roles, envelopes, or Decimal string conventions.
- Added Prisma domain schema, additive migration, seed data, request IDs, JWT authentication, RBAC, validation, error normalization, and CSV export support.
- Added runtime implementation for operational emissions, Product ESG Profiles, diversity, training, reward redemption, scores, dashboards, reports, notifications, activity logs, and protected admin jobs.
- No refresh-token, server logout, multipart upload, PDF export, or Excel export endpoint was added.

## 2026-07-12 - Backend Phase 0 Contract Freeze

- Added `contracts/openapi.yaml` as the MVP API contract source of truth.
- Froze backend roles to `ADMIN`, `ESG_MANAGER`, `EMPLOYEE`, and `AUDITOR`.
- Froze auth endpoints to `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, and `GET /api/v1/auth/me`.
- Confirmed no MVP `/auth/register`, `/auth/refresh`, or `/auth/logout` endpoints.
- Froze success, paginated success, and error envelopes with `meta.requestId`.
- Froze decimal serialization as JSON strings.
- Added operational emission preview and ingestion routes for narrow ERP-like MVP integration.
- Kept reward redemption in MVP with atomic future implementation and `409` race/conflict errors.
- Added Product ESG Profiles, Diversity Snapshots, Training Records, CSV report exports, and protected admin/demo job endpoints to the MVP contract.
- Deferred policy versioning, PDF/Excel exports, multipart uploads, local file storage, base64 uploads, server logout, refresh tokens, and distributed queue infrastructure.
