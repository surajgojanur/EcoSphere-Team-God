# EcoSphere UI and GSAP Implementation Tracker

## Project Metadata

- Current branch: `feat/ui-gsap-foundation`
- Frontend owner: Dev 4 / Frontend shell owner
- Current phase: PHASE 1 - UI and GSAP foundation
- Last updated date: 2026-07-12
- API contract status: No `contracts/openapi.yaml` or generated API types present in repository
- Backend integration status: Foundation `/health` endpoint integrated; ESG module APIs are not implemented yet

## Status Rules

- [ ] Not started
- [x] Implemented and verified

Never remove completed tasks.

A task may become [x] only after:

- implementation is present
- TypeScript passes
- tests pass when applicable
- Docker frontend starts
- the feature is manually or browser-verified
- reduced-motion behaviour is considered

## Full Phase Roadmap

### PHASE 0 - Discovery and planning

- Objective: confirm branch, repo baseline, documentation, ownership boundaries and API status before UI work.
- Dependencies: Docker baseline merged into `main`; docs available.
- Estimated complexity: Low.
- Acceptance criteria: current branch is safe, docs are read, conflicts are recorded, implementation plan exists.
- Test checklist: repository inspection commands complete; baseline files present on `main`.
- Status:
  - [x] Repository and branch inspected
  - [x] Docker baseline confirmed on `main`
  - [x] Markdown documentation inspected
  - [x] API contract absence recorded

### PHASE 1 - UI and GSAP foundation

- Objective: create the routed app shell, design tokens, GSAP architecture, reusable primitives, motion utilities and dashboard preview.
- Dependencies: React/Vite/Tailwind baseline.
- Estimated complexity: High.
- Acceptance criteria: shell, routes, primitives, motion utilities, reduced-motion behavior and Docker validation pass.
- Test checklist: frontend test/typecheck/build; Docker frontend healthy; browser route/mobile/reduced-motion checks pass.
- Status:
  - [x] `gsap` and `@gsap/react` installed
  - [x] Central GSAP registration added
  - [x] Motion tokens added
  - [x] App routing added
  - [x] Responsive shell added
  - [x] Placeholder routes added
  - [x] Reusable UI primitives added
  - [x] Reusable motion components added
  - [x] Dashboard preview added
  - [x] Reduced-motion behavior verified
  - [x] Browser console checked for React/GSAP warnings

### PHASE 2 - Authentication UI

- Objective: implement login, registration and auth context once auth API is ready.
- Dependencies: `/auth/login`, `/auth/signup`, `/auth/me`, JWT response contract.
- Estimated complexity: Medium.
- Acceptance criteria: accessible forms, validation states, loading/error states, success transition to dashboard.
- Test checklist: keyboard form flow, invalid field states, loading button state, route redirect behavior.
- Status:
  - [ ] Login page implementation
  - [ ] Registration page implementation
  - [ ] Auth context and route guards
  - [ ] Branded auth motion sequence

### PHASE 3 - ESG dashboard

- Objective: replace dashboard mock data with API-backed executive ESG snapshot.
- Dependencies: dashboard APIs and score engine.
- Estimated complexity: High.
- Acceptance criteria: live score cards, trend chart, department ranking, recent activity and quick actions.
- Test checklist: loading/error states, chart accessibility, responsive grids, animated numeric final states.
- Status:
  - [ ] API-backed score cards
  - [ ] Emissions trend visualization
  - [ ] Department ranking
  - [ ] Recent activity feed
  - [ ] Dashboard animation polish

### PHASE 4 - Environmental module

- Objective: implement emission factors, carbon transactions and environmental goals.
- Dependencies: environmental APIs, server-side emission calculation.
- Estimated complexity: High.
- Acceptance criteria: tables, modals, forms, validation surfacing and progress bars.
- Test checklist: form validation, table mobile behavior, calculation preview as non-authoritative UI only.
- Status:
  - [ ] Emission factors UI
  - [ ] Carbon transactions UI
  - [ ] Environmental goals UI
  - [ ] Goal progress animations

### PHASE 5 - Social and Gamification modules

- Objective: implement CSR, participations, challenges, badges, rewards and leaderboard.
- Dependencies: social/gamification APIs and server-owned award/redemption rules.
- Estimated complexity: High.
- Acceptance criteria: activity cards, approval queues, challenge filters, badge/reward presentation and leaderboard.
- Test checklist: optimistic states, approval feedback, restrained reward/badge motion, no client-owned business rule decisions.
- Status:
  - [ ] CSR activities
  - [ ] Participation approvals
  - [ ] Challenges
  - [ ] Badges
  - [ ] Rewards
  - [ ] Leaderboard

### PHASE 6 - Governance, Reports, Notifications and Settings

- Objective: implement governance workflows, fixed reports, notification list and admin settings.
- Dependencies: governance/report/settings APIs and RBAC.
- Estimated complexity: High.
- Acceptance criteria: policy/audit/compliance flows, report generation states, admin-only settings shells wired.
- Test checklist: severity/status text, overdue warnings, report loading/error states, role-gated UI.
- Status:
  - [ ] Policies
  - [ ] Audits
  - [ ] Compliance issues
  - [ ] Reports
  - [ ] Notifications
  - [ ] Settings

### PHASE 7 - Advanced Motion Polish

- Objective: add only meaningful advanced motion after core workflows are stable.
- Dependencies: completed pages and performance budget.
- Estimated complexity: Medium.
- Acceptance criteria: each advanced effect has reduced-motion fallback and measurable product value.
- Test checklist: performance, reduced motion, route cleanup and cross-browser checks.
- Status:
  - [ ] Selective ScrollTrigger sections
  - [ ] SVG sustainability motifs
  - [ ] Pointer-aware accents
  - [ ] Refined empty/error states

### PHASE 8 - API Integration and Final QA

- Objective: replace mocks with APIs and harden the app for demo.
- Dependencies: accepted API contract and backend readiness.
- Estimated complexity: High.
- Acceptance criteria: all loading/error states verified, RBAC UI validated, responsive and keyboard QA complete.
- Test checklist: Docker validation, browser console, reduced motion, route cleanup, cross-browser checks and demo rehearsal.
- Status:
  - [ ] Mock replacement
  - [ ] Loading/error state QA
  - [ ] RBAC UI QA
  - [ ] Final responsive QA
  - [ ] Demo flow rehearsal

## Animation Inventory

| ID | Component | Trigger | Technique | Duration | Ease | Reduced Motion | Performance Risk | Status |
|---|---|---|---|---:|---|---|---|---|
| UI-MOTION-001 | App shell | Initial mount | Timeline + stagger | 0.16-0.42s | `power3.out` | Immediate visibility | Low | [x] |
| UI-MOTION-002 | Sidebar active indicator | Route change | `fromTo` scoped indicator | 0.16s | `power3.out` | Immediate state | Low | [x] |
| UI-MOTION-003 | Sidebar collapse | Button click | Width + label opacity | 0.16-0.42s | `power3.out` | Zero-duration set | Medium | [x] |
| UI-MOTION-004 | Mobile drawer | Menu open | Backdrop fade + drawer slide + item stagger | 0.16-0.42s | `power3.out` | Fade only | Low | [x] |
| UI-MOTION-005 | Page entrance | Route change | Scoped `PageTransition` `fromTo` | 0.42s | `power3.out` | Opacity only | Low | [x] |
| UI-MOTION-006 | KPI card reveal | Dashboard mount | Stagger + subtle y/scale | 0.42s | `power3.out` | Immediate visibility | Low | [x] |
| UI-MOTION-007 | Card hover | Desktop pointer | `quickTo` tilt + lift | 0.16-0.42s | `power3.out` | Disabled | Low | [x] |
| UI-MOTION-008 | Button interaction | Hover/press | Scoped `to` with `contextSafe` listeners | 0.08-0.16s | `power3.out` | CSS/static state | Low | [x] |
| UI-MOTION-009 | Modal and drawer | Open/Escape/backdrop | Timeline scale/fade or slide | 0.16-0.42s | `power3.out` | Fade only | Low | [x] |
| UI-MOTION-010 | Health indicator | Health state change | Color class + scoped scale/fade | 0.16s | `power3.out` | Immediate state | Low | [x] |

## Blockers

- [ ] API contract not present: no `contracts/openapi.yaml` and no generated API types.
- [ ] Auth API not implemented, so login/register remain placeholders.
- [ ] Dashboard APIs not implemented, so Phase 1 dashboard uses mock presentation data.
- [ ] ESG business modules are intentionally not implemented in Phase 1.

## Decision Log

- 2026-07-12: Use React Router for Phase 1 route skeletons so later phases can fill pages without replacing navigation.
- 2026-07-12: Use `lucide-react` for icons because no icon system existed and it is lightweight.
- 2026-07-12: Keep business-module data mocked under `frontend/src/mocks`; do not place arrays inside page components.
- 2026-07-12: Do not use ScrollTrigger in Phase 1 because pages are shell/dashboard surfaces without meaningful long-scroll storytelling.
- 2026-07-12: Keep dark enterprise theme from existing UI guidelines and add motion/design tokens around it.
- 2026-07-12: Treat the Vite production chunk-size warning as a Phase 3+ code-splitting risk, not a Phase 1 blocker.
