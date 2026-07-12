# EcoSphere API Changelog

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
