# 07 — Role Permissions

> Related: [05_BUSINESS_RULES](./05_BUSINESS_RULES.md) · [03_BACKEND_API](./03_BACKEND_API.md)
> Roles: **Admin**, **ESG Manager**, **Employee**, **Auditor**

## Full RBAC Matrix

| Page / Resource | Action | Admin | ESG Manager | Employee | Auditor |
|---|---|:---:|:---:|:---:|:---:|
| **Dashboard** | View | ✅ | ✅ | ✅ | ✅ |
| **Departments** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ | ❌ | ❌ |
| **Categories** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ❌ | ❌ | ❌ |
| **Emission Factors** | View | ✅ | ✅ | ✅ | ❌ |
| | Create/Edit/Delete | ✅ | ✅ | ❌ | ❌ |
| **Carbon Transactions** | View | ✅ | ✅ | ✅ | ❌ |
| | Create | ✅ | ✅ | ✅ | ❌ |
| | Edit/Delete | ✅ | ✅ | ❌ | ❌ |
| **Environmental Goals** | View | ✅ | ✅ | ✅ | ❌ |
| | Create/Edit | ✅ | ✅ | ❌ | ❌ |
| **CSR Activities** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ✅ | ❌ | ❌ |
| | Join | ❌ | ❌ | ✅ | ❌ |
| **Employee Participation** | View queue | ✅ | ✅ | own only | ✅ (read) |
| | Approve/Reject | ✅ | ✅ | ❌ | ❌ |
| **Policies** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit | ✅ | ✅ | ❌ | ❌ |
| | Acknowledge | ❌ | ❌ | ✅ | ❌ |
| **Audits** | View | ✅ | ✅ | ❌ | ✅ |
| | Create | ✅ | ✅ | ❌ | ✅ |
| | Close | ✅ | ✅ | ❌ | ✅ (own audit) |
| **Compliance Issues** | View | ✅ | ✅ | own (as owner) | ✅ |
| | Create | ✅ | ✅ | ❌ | ✅ |
| | Resolve | ✅ | ✅ | ✅ (if owner) | ❌ |
| **Challenges** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit/Delete | ✅ | ✅ | ❌ | ❌ |
| | Join | ❌ | ❌ | ✅ | ❌ |
| **Challenge Participation** | Approve | ✅ | ✅ | ❌ | ❌ |
| **Badges** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit | ✅ | ✅ | ❌ | ❌ |
| **Rewards** | View | ✅ | ✅ | ✅ | ✅ |
| | Create/Edit | ✅ | ✅ | ❌ | ❌ |
| | Redeem | ❌ | ❌ | ✅ | ❌ |
| **Leaderboard** | View | ✅ | ✅ | ✅ | ✅ |
| **Reports** | View/Generate | ✅ | ✅ | ❌ | ✅ (governance only) |
| | Export | ✅ | ✅ | ❌ | ✅ |
| | Configure (Custom Builder) | ✅ | ✅ | ❌ | ❌ |
| **ESG Configuration** | View/Edit | ✅ | ❌ | ❌ | ❌ |
| **Notification Settings** | View/Edit | ✅ | ❌ | ❌ | ❌ |

**Legend**: ✅ allowed · ❌ not allowed · "own only" scoped to the user's own records

## Enforcement Points

- [ ] Every route above wrapped with `rbac(...)` middleware matching this table exactly
- [ ] "own only" rows enforced at the Service layer (filter query by `req.user.id`), not just hidden in UI
- [ ] Settings pages (`/settings/*`) additionally wrapped by `RequireRole(['ADMIN'])` at the frontend route level as defense-in-depth

---
**Next:** [08_TASK_BOARD.md](./08_TASK_BOARD.md)

## Backend MVP Implementation Note

The API and database role enum is limited to `ADMIN`, `ESG_MANAGER`, `EMPLOYEE`, and `AUDITOR`. Frontend display text may call `ESG_MANAGER` “Sustainability Manager”, but transmitted values must remain `ESG_MANAGER`.
