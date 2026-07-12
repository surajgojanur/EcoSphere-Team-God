# 13 — Testing Checklist

> Related: [05_BUSINESS_RULES](./05_BUSINESS_RULES.md) · [07_ROLE_PERMISSIONS](./07_ROLE_PERMISSIONS.md)
> Given the 8-hour constraint, testing is manual only — no automated test suite is in MVP scope.

## 0. Foundation / Docker Baseline

- [x] `backend npm test` passes locally
- [x] `backend npm run typecheck` passes locally
- [x] `backend npm run build` passes locally
- [x] `frontend npm test` passes locally
- [x] `frontend npm run typecheck` passes locally
- [x] `frontend npm run build` passes locally
- [x] `.env` is ignored by Git
- [x] `docker-compose.yml` parses as YAML
- [ ] `docker compose config` succeeds on a machine with Docker installed
- [x] `docker compose build --no-cache` succeeds on a machine with Docker installed
- [x] `docker compose up -d` starts `db`, `backend`, and `frontend`
- [x] `docker compose ps` shows healthy services
- [x] `docker compose exec -T db pg_isready` succeeds
- [x] `curl --fail http://localhost:4000/health` succeeds
- [x] `curl --fail http://localhost:4000/ready` confirms database connectivity
- [x] `curl --fail http://localhost:3000` returns the frontend
- [x] Frontend page displays backend connection success
- [x] Frontend displays backend connection success after backend restart
- [x] Backend hot reload reflects source edits in `/health`
- [x] Frontend hot reload reflects source edits in Chromium-rendered DOM
- [x] Restarting the stack preserves PostgreSQL data
- [x] `docker compose down` followed by `docker compose up -d` preserves PostgreSQL data when volumes are not deleted
- [x] Logs checked for permission errors and secret exposure
- [ ] Verify setup on Apple Silicon macOS
- [ ] Verify setup on Intel macOS
- [x] Verify setup on Fedora with SELinux enforcing

Validation notes from 2026-07-12 on Fedora 44 with SELinux Enforcing:

- Existing containerized backend and frontend tests, type checks, and builds passed.
- PostgreSQL persistence was verified with the `system_status` marker key `persistence_validation` across `db` restart and `docker compose down` / `docker compose up -d` without `-v`.
- SELinux bind mounts were verified by reading and writing temporary files in backend and frontend `/app` mounts; mounts showed `seclabel`.
- Chromium checks used `timeout 20s`; no timeout exit code `124` occurred.
- Log review found no permission errors and no actual secret values. A generic dotenv tip containing the word `secrets` appeared, but no secret material was logged.

## 1. Manual Testing — Auth

- [ ] Signup creates a user with role EMPLOYEE regardless of any client-side tampering
- [ ] Login with correct credentials returns token + user
- [ ] Login with wrong password returns 401
- [ ] Accessing a protected route with no token returns 401
- [ ] Accessing an Admin-only route as Employee returns 403

## 2. API Testing

- [ ] `POST /carbon-transactions` — calculatedEmission computed server-side, matches quantity × factor
- [ ] `POST /rewards/:id/redeem` — insufficient points returns 400 `INSUFFICIENT_POINTS`
- [ ] `POST /rewards/:id/redeem` — concurrent redemption of last stock unit: one 200, one 400/409
- [ ] `POST /compliance-issues` — missing `dueDate` or `owner` returns 400
- [ ] `POST /challenges/:id/join` — joining a Completed/Archived challenge returns 400
- [ ] `PATCH /participations/:id/approve` — blocked if `evidenceRequired=true` and no proof uploaded
- [ ] `POST /policies/:id/acknowledge` — second acknowledgement by same user is a no-op, not an error
- [ ] Pagination: `GET /csr-activities?page=2&limit=5` returns correct slice + `meta.total`

## 3. UI Testing

- [ ] Sidebar navigation matches wireframe sections exactly
- [ ] Dashboard score cards render live values (not hardcoded)
- [ ] Environmental Goals progress bars reflect `current/target` accurately
- [ ] Social: Join button on CSR Activity card updates to "Pending" without full page reload
- [ ] Governance: Compliance Issues table shows severity badges with correct color
- [ ] Gamification: Challenge status filter tabs (Draft/Active/Under Review/Completed/Archived) filter correctly
- [ ] Reports: Generate button shows loading state, then renders data
- [ ] Settings: toggling ESG Configuration switch persists on page refresh

## 4. Validation Testing

- [ ] Department code uniqueness enforced (duplicate returns field error, not generic 500)
- [ ] Environmental Goal deadline in the past is rejected on create
- [ ] Reward `pointsRequired` must be positive integer

## 5. Security Testing

- [ ] JWT expiry respected (expired token returns 401, not 500)
- [ ] SQL injection attempt in search query param is safely parameterized (Prisma handles this by default — verify no raw query strings are used)
- [ ] Passwords never returned in any API response (check `/auth/me`, `/departments` with nested user)
- [ ] Role check happens server-side even when frontend hides the button (test via direct API call as Employee)

## 6. Performance Testing

- [ ] Dashboard loads in under 2s with seeded data (~50 records per table)
- [ ] Score calculation for all departments completes in under 1s at demo data scale

## 7. Regression Testing (run before final demo)

- [ ] Full user journey: signup → login → log carbon transaction → join CSR activity → get approved → badge awarded → redeem reward → check leaderboard updated
- [ ] Full governance journey: create audit → raise compliance issue → mark resolved → issue no longer shows as overdue
- [ ] Dashboard scores update after new data logged (no stale cache)

---
**Next:** [14_DEMO_SCRIPT.md](./14_DEMO_SCRIPT.md)
