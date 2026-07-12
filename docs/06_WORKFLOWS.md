# 06 — Workflows

> Related: [05_BUSINESS_RULES](./05_BUSINESS_RULES.md) · [03_BACKEND_API](./03_BACKEND_API.md)
> Each workflow lists steps, expected output, DB updates, and notifications fired.

## 1. User Registration

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant B as Backend
    participant DB as DB
    U->>F: fills signup form
    F->>B: POST /auth/signup
    B->>DB: check email unique
    B->>DB: insert User(role=EMPLOYEE)
    B-->>F: 201 {user}
    F->>F: redirect to /login
```
- **DB Updates**: new `User` row, `role = EMPLOYEE` always (no self-elevation)
- **Notifications**: none

## 2. Login

- **Steps**: 1) submit credentials 2) backend verifies bcrypt hash 3) JWT issued 4) frontend stores token, redirects to Dashboard
- **Expected Output**: `{ token, user }`
- **DB Updates**: none (read-only)
- **Notifications**: none

## 3. Carbon Transaction Logging

```mermaid
sequenceDiagram
    actor E as Employee/Manager
    participant F as Frontend
    participant B as Backend
    participant DB as DB
    E->>F: selects department, emission factor, quantity, date
    F->>B: POST /carbon-transactions
    B->>DB: fetch EmissionFactor.factorValue
    B->>B: calculatedEmission = quantity * factorValue
    B->>DB: insert CarbonTransaction
    B-->>F: 201 {transaction}
    F->>F: refresh Emissions Trend chart
```
- **DB Updates**: new `CarbonTransaction` row
- **Notifications**: none (score recompute happens on next scheduled run, not synchronously)

## 4. CSR Participation

```mermaid
sequenceDiagram
    actor E as Employee
    participant F as Frontend
    participant B as Backend
    participant DB as DB
    participant N as NotificationService
    E->>F: clicks Join on CSR Activity card
    F->>B: POST /csr-activities/:id/join
    B->>DB: insert EmployeeParticipation(status=PENDING)
    B-->>F: 201
    Note over B,DB: later — ESG Manager reviews
    actor M as ESG Manager
    M->>F: clicks Approve
    F->>B: PATCH /participations/:id/approve
    B->>DB: check proof exists if evidenceRequired
    B->>DB: update status=APPROVED, pointsEarned=activity.points
    B->>N: notify(employee, "participation approved")
    B->>B: run badge-check (see Business Rules §7)
    B-->>F: 200 {participation, badgeAwarded?}
```
- **DB Updates**: `EmployeeParticipation` insert then update; possible `EmployeeBadge` insert
- **Notifications**: employee notified of approval/rejection; employee notified if badge unlocked

## 5. Challenge Participation

- **Steps**: 1) employee joins active Challenge → `ChallengeParticipation(PENDING, progress=0)` 2) employee updates progress + proof 3) ESG Manager approves → `xpAwarded = challenge.xp` 4) badge-check runs
- **Expected Output**: participation record with final `xpAwarded`
- **DB Updates**: `ChallengeParticipation` insert/update, possible `EmployeeBadge` insert
- **Notifications**: approval/rejection to employee; badge unlock if applicable

## 6. Badge Assignment (Auto)

```mermaid
sequenceDiagram
    participant Svc as ParticipationService
    participant Badge as BadgeService
    participant DB as DB
    participant N as NotificationService
    Svc->>Badge: onApproval(employeeId)
    Badge->>DB: fetch employee totals (XP, completed count, CSR count)
    Badge->>DB: fetch all Badges not yet earned by employee
    loop each candidate badge
        Badge->>Badge: evaluate unlockRule against totals
        alt rule met
            Badge->>DB: insert EmployeeBadge
            Badge->>N: notify(employee, "badge unlocked")
        end
    end
```
- **DB Updates**: 0+ `EmployeeBadge` rows
- **Notifications**: one per badge unlocked

## 7. Reward Redemption

```mermaid
sequenceDiagram
    actor E as Employee
    participant F as Frontend
    participant B as Backend
    participant DB as DB
    E->>F: clicks Redeem on Reward card
    F->>B: POST /rewards/:id/redeem
    B->>DB: fetch employee total points
    B->>DB: fetch reward (stock, pointsRequired)
    alt insufficient points or stock=0
        B-->>F: 400 INSUFFICIENT_POINTS / OUT_OF_STOCK
    else valid
        B->>DB: atomic decrement stock WHERE stock>0
        B->>DB: insert RewardRedemption(pointsSpent)
        B-->>F: 200 {redemption, remainingPoints}
    end
```
- **DB Updates**: `RewardRedemption` insert, `Reward.stock` decrement
- **Notifications**: confirmation toast only (no persistent notification required)

## 8. Policy Acknowledgement

- **Steps**: 1) policy published → notification fanned out to all employees 2) employee opens Policy, clicks Acknowledge 3) `PolicyAcknowledgement` row inserted (unique per policy+employee)
- **Expected Output**: acknowledgement recorded, employee's pending-acknowledgement count decreases
- **DB Updates**: `PolicyAcknowledgement` insert (idempotent — re-click is a no-op, unique constraint)
- **Notifications**: initial publish notification; reminder notification for stragglers (stretch, cron-driven)

## 9. Compliance Issue Resolution

```mermaid
sequenceDiagram
    actor A as Auditor
    participant F as Frontend
    participant B as Backend
    participant DB as DB
    participant N as NotificationService
    A->>F: raises issue during Audit review
    F->>B: POST /compliance-issues {auditId, severity, owner, dueDate}
    B->>DB: insert ComplianceIssue(status=OPEN)
    B->>N: notify(owner, "new compliance issue")
    Note over A,DB: later — owner resolves
    actor O as Owner
    O->>F: marks Resolved
    F->>B: PATCH /compliance-issues/:id {status: RESOLVED}
    B->>DB: update status, clear is_overdue
    B-->>F: 200
```
- **DB Updates**: `ComplianceIssue` insert then update
- **Notifications**: owner notified on creation; ESG Manager notified if it becomes overdue before resolution (nightly cron)

## 10. Report Generation

```mermaid
sequenceDiagram
    actor M as ESG Manager
    participant F as Frontend
    participant B as Backend
    participant DB as DB
    M->>F: clicks Generate on Environmental Report
    F->>B: GET /reports/environmental
    B->>DB: aggregate CarbonTransactions + Goals by department
    B->>B: check today's DepartmentScore exists; if not, compute now
    B-->>F: 200 {report data}
    F->>F: render charts/table, enable CSV export
```
- **DB Updates**: possible `DepartmentScore` insert if none exists for today (lazy computation fallback alongside nightly cron)
- **Notifications**: none

## 11. Settings Update (ESG Configuration)

- **Steps**: 1) Admin toggles e.g. "Auto-award badges on challenge completion" 2) `PATCH /esg-configuration` 3) config row updated (singleton row, `id` fixed)
- **Expected Output**: toggle reflected immediately; affects behavior of §6 badge engine on next trigger
- **DB Updates**: `ESGConfiguration` row update
- **Notifications**: none

---
**Next:** [07_ROLE_PERMISSIONS.md](./07_ROLE_PERMISSIONS.md)
