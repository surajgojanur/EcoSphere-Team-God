# 04 — Frontend Pages

> Related: [03_BACKEND_API](./03_BACKEND_API.md) · [11_UI_GUIDELINES](./11_UI_GUIDELINES.md)
> Framework: React + Tailwind · Routing: React Router

## Page: Login / Signup
- **Purpose**: authenticate, create Employee-only accounts
- **Components**: `AuthCard`, `TextInput`, `PasswordInput`, `Button`
- **Forms**: email (required, email format), password (required, min 8 chars)
- **Buttons**: "Log in", "Sign up", "Forgot password?" (stub link)
- **Loading**: button spinner, disabled during request
- **Error**: inline red text under field + toast for 401
- **Empty**: n/a
- **API Calls**: `POST /auth/login`, `POST /auth/signup`
- **Routing**: `/login`, `/signup` → redirect to `/dashboard` on success
- **Responsive**: single-column centered card, full-width on mobile
- **Accessibility**: labeled inputs, `aria-invalid` on error, focus trap in card
- **State**: local form state + `useAuth().login()`

## Page: Dashboard (`/dashboard`)
- **Purpose**: executive ESG snapshot
- **Components**: `ScoreCard` ×4, `LineChart` (emissions trend), `BarChart` (department ranking), `ActivityFeed`, `QuickActionButton` ×3
- **Forms**: none
- **Buttons**: Log Carbon Data, Start Challenge, View Reports (navigate)
- **Loading**: skeleton cards while `/dashboard/scores` etc. resolve
- **Error**: retry banner if any dashboard fetch fails
- **Empty**: "No activity yet" state for Recent Activity feed
- **API Calls**: `GET /dashboard/scores`, `/dashboard/emissions-trend`, `/dashboard/department-ranking`, `/dashboard/recent-activity`
- **Routing**: default route after login
- **Responsive**: 4-card grid → 2×2 → stacked on mobile
- **Accessibility**: score cards are `role="region"` with `aria-label`
- **State**: `useFetch` per widget, parallel requests

## Page: Environmental (`/environmental`)
- **Tabs**: Emission Factors · Product ESG Profiles · Carbon Transactions · Environmental Goals
- **Components**: `DataTable`, `ProgressBar`, `Modal` (create/edit), `SearchInput`
- **Forms**: Goal form (name, department, target CO2, deadline); Carbon Transaction form (department, emission factor, quantity, date)
- **Validation**: quantity > 0, deadline ≥ today
- **Buttons**: New Goal, Edit, Delete, Export (CSV), row actions (View/Edit/Delete)
- **Loading**: table skeleton rows
- **Error**: inline toast, form field errors from API validation response
- **Empty**: "No goals yet — create your first goal"
- **API Calls**: full CRUD set from [03_BACKEND_API](./03_BACKEND_API.md#environmental)
- **Routing**: `/environmental?tab=goals`
- **Responsive**: table → card list on mobile
- **Accessibility**: table has `<caption>`, sortable headers are buttons with `aria-sort`
- **State**: tab state in URL query param

## Page: Social (`/social`)
- **Tabs**: CSR Activities · Employee Participation · Diversity Dashboard
- **Components**: `ActivityCard` (icon, joined count, Join button), `ApprovalQueueTable` (Approve/Reject buttons), `DiversityChart`
- **Forms**: New Activity (title, category, description, evidence required toggle, event date)
- **Buttons**: New Activity, Join, Approve, Reject
- **Loading**: card skeletons, table skeleton
- **Error**: "Failed to join — try again" toast
- **Empty**: "No pending approvals"
- **API Calls**: `/csr-activities`, `/csr-activities/:id/join`, `/participations`, `/participations/:id/approve|reject`, `/social/diversity`
- **Routing**: `/social?tab=participation`
- **Responsive**: activity cards 4-col → 2-col → 1-col
- **Accessibility**: Approve/Reject buttons have `aria-label` including employee name
- **State**: optimistic update on Join (card shows "Pending" immediately)

## Page: Governance (`/governance`)
- **Tabs**: Policies · Policy Acknowledgements · Audits · Compliance Issues
- **Components**: `DataTable`, `SeverityBadge`, `StatusBadge`, `Modal`
- **Forms**: New Audit (title, department, auditor, date range); Compliance Issue (auto-created from audit findings, editable: severity, owner, due date)
- **Validation**: due date required, owner required (per business rule)
- **Buttons**: New Audit, Export, row actions
- **Loading**: table skeleton
- **Error**: toast on save failure
- **Empty**: "No audits scheduled"
- **API Calls**: `/policies`, `/audits`, `/compliance-issues` CRUD
- **Routing**: `/governance?tab=audits`
- **Responsive**: table horizontal scroll on mobile rather than reflow (columns are dense)
- **Accessibility**: severity/status badges carry text, not color alone
- **State**: overdue issues computed client-side from `due_date < today` for the visual flag, source of truth is server `is_overdue`

## Page: Gamification (`/gamification`)
- **Tabs**: Challenges · Challenge Participation · Badges · Rewards · Leaderboard
- **Components**: `ChallengeCard` (XP, difficulty, deadline, status pill, Join button), `StatusFilterTabs` (Draft/Active/Under Review/Completed/Archived), `BadgeGalleryGrid`, `LeaderboardTable`, `RewardCard`
- **Forms**: New Challenge (title, category, description, xp, difficulty, evidence required, deadline)
- **Buttons**: New Challenge, Join Challenge, Redeem (on Reward card)
- **Loading**: card grid skeleton
- **Error**: "Not enough points" inline message on failed redemption (maps to `INSUFFICIENT_POINTS`)
- **Empty**: "No badges earned yet" in Badge Gallery
- **API Calls**: `/challenges`, `/challenges/:id/join`, `/challenge-participations`, `/badges`, `/rewards`, `/rewards/:id/redeem`, `/leaderboard`
- **Routing**: `/gamification?tab=challenges&status=active`
- **Responsive**: challenge cards 3-col → 1-col; leaderboard table scrolls
- **Accessibility**: status filter tabs are a `tablist` with `aria-selected`
- **State**: challenge status filter in URL; leaderboard scope toggle (employee/department) local state

## Page: Reports (`/reports`)
- **Tabs**: Environmental · Social · Governance · ESG Summary · Custom Builder
- **Components**: `ReportCard` (icon, description, Generate button), `FilterBar` (Date Range, Department, Module, Employee, Challenge, ESG Category), `ExportButtonGroup`
- **Forms**: Custom Report filter form (all optional, at least one recommended)
- **Buttons**: Generate (×4 fixed reports), Run Report, Export CSV (MVP) / PDF / Excel (stretch)
- **Loading**: spinner on Generate click, disables button
- **Error**: "Report generation failed" toast
- **Empty**: "Run a report to see results here"
- **API Calls**: `/reports/environmental|social|governance|esg-summary`, `/reports/custom` (stretch)
- **Routing**: `/reports?tab=summary`
- **Responsive**: filter bar wraps to 2 rows on mobile
- **Accessibility**: generated report renders in a `role="region"` with `aria-live="polite"` for screen-reader announcement on completion
- **State**: filter state local to Custom Builder tab, cleared on tab switch

## Page: Settings (`/settings`) — Admin only
- **Tabs**: Departments · Categories · ESG Configuration · Notification Settings
- **Components**: `DataTable`, `ToggleSwitch` ×4 (auto emission calc, evidence required, auto badge award, email alerts), `Modal`
- **Forms**: New Department (name, code, head, parent department, status); New Category (name, type)
- **Validation**: department code unique (server-enforced, surfaced as field error)
- **Buttons**: New Department, Edit, Delete (deactivate)
- **Loading**: table skeleton, toggle shows brief disabled state on save
- **Error**: "Code already exists" inline field error
- **Empty**: n/a (seed data always present)
- **API Calls**: `/departments`, `/categories`, `/esg-configuration`, `/notification-settings`
- **Routing**: `/settings?tab=departments`
- **Responsive**: table → stacked cards
- **Accessibility**: toggle switches are real `<button role="switch" aria-checked>`, not div-only
- **State**: config toggles fetched once, optimistic update with rollback on error

## Global Layout
- **Sidebar navigation** (per wireframe): Dashboard, Environmental (+3 sub-items), Social (+3), Governance (+4), Gamification (+5), Reports (+6), Settings (+4)
- **Top bar**: module tab strip (Dashboard/Environmental/Social/Governance/Gamification/Reports/Settings) — mirrors sidebar for quick module switching, matches wireframe exactly
- **Route guard**: `ProtectedRoute` wraps all pages except `/login`, `/signup`; Settings additionally wrapped by `RequireRole(['ADMIN'])`

---
**Next:** [05_BUSINESS_RULES.md](./05_BUSINESS_RULES.md)
