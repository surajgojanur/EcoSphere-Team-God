# 14 — Demo Script

> Related: [00_PROJECT_OVERVIEW](./00_PROJECT_OVERVIEW.md) · [06_WORKFLOWS](./06_WORKFLOWS.md)
> Total time: 5 minutes. Rehearse at Hour 7:45 per [00_PROJECT_OVERVIEW timeline](./00_PROJECT_OVERVIEW.md#13-project-timeline-8-hour-hackathon).

## Roles

| Presenter | Segment | Duration |
|---|---|---|
| Presenter 1 (Dev 1) | Problem + Dashboard | 60s |
| Presenter 2 (Dev 2) | Environmental | 60s |
| Presenter 3 (Dev 3) | Social + Gamification | 90s |
| Presenter 4 (Dev 4) | Governance + Reports + Close | 90s |

## Segment 1 — Problem + Dashboard (Presenter 1, 60s)

**Speaking script:**
"ESG reporting today is manual and disconnected — spreadsheets updated quarterly, no live view. EcoSphere pulls ESG directly into daily operations. Here's the Dashboard — Environmental, Social, Governance, and Overall ESG Score, all computed live from real data underneath."

**Screens to open**: `/dashboard`
**Expected output**: 4 score cards populated, emissions trend chart, department ranking bar chart
**Backup**: if live scores haven't recomputed, have a pre-seeded department score row ready and mention "recomputed nightly, shown here on-demand"

## Segment 2 — Environmental (Presenter 2, 60s)

**Speaking script:**
"Every carbon transaction is logged against an emission factor — the system calculates emissions automatically, not a manual spreadsheet formula. Here's a goal — Reduce Fleet Emissions — tracking live progress toward target."

**Screens to open**: `/environmental` → Carbon Transactions tab, then Environmental Goals tab
**Expected output**: creating a new transaction updates the emissions trend on Dashboard when navigated back
**Backup**: pre-seeded transaction ready to show if live entry has a hiccup

## Segment 3 — Social + Gamification (Presenter 3, 90s)

**Speaking script:**
"Employees join CSR activities — here's Tree Plantation, 24 people joined. When a manager approves participation, points are awarded, and — watch — this triggers our badge engine automatically. No manual admin step. Points feed into the leaderboard, which employees can redeem for rewards."

**Screens to open**: `/social` (Join flow) → `/gamification` (Approve queue → Badge Gallery → Leaderboard)
**Expected output**: live approval triggers badge notification
**Backup**: if badge auto-award timing is flaky live, have a pre-approved record ready to show the resulting badge directly

## Segment 4 — Governance + Reports + Close (Presenter 4, 90s)

**Speaking script:**
"On the Governance side, audits raise compliance issues — always with an owner and a due date, so nothing falls through the cracks. Overdue issues are auto-flagged. Finally, Reports — Environmental, Social, Governance, and an ESG Summary, exportable for management. That's EcoSphere — a live, auditable, gamified ESG platform built in 8 hours."

**Screens to open**: `/governance` (Compliance Issues, severity badges) → `/reports` (Generate ESG Summary)
**Expected output**: report renders with real aggregated numbers matching Dashboard scores
**Backup**: static screenshot of ESG Summary report if live generation is slow

## Backup Demo Plan (if live environment fails entirely)

- [ ] Pre-recorded 90-second screen capture of the full user journey, ready to play
- [ ] Static screenshots of all 7 wireframe screens with real seeded data, exported as a fallback slide deck
- [ ] Local Docker environment on a second laptop as hot spare

---
**Next:** [15_FUTURE_SCOPE.md](./15_FUTURE_SCOPE.md)
