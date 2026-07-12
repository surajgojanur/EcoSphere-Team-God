# 15 — Future Scope

> Related: [00_PROJECT_OVERVIEW §17 Out of Scope](./00_PROJECT_OVERVIEW.md#17-out-of-scope-explicitly-cut--mention-in-pitch-do-not-build)

## 1. Immediate Post-Hackathon Additions (cut from MVP, build next)

- [ ] Auto Emission Calculation from Purchase/Manufacturing/Fleet/Expense records (toggle already stubbed in ESG Configuration)
- [ ] Custom Report Builder with live filter combinations + PDF/Excel export
- [ ] Reward stock management with low-stock alerts
- [ ] Email notifications (currently in-app only)
- [ ] Policy acknowledgement reminder cron

## 2. AI Integration

- Natural-language query over ESG data ("which department improved governance score most this quarter?")
- LLM-generated narrative summaries for the ESG Summary report (turn the 4 numeric scores into an executive-readable paragraph)
- Anomaly detection on Carbon Transactions (flag entries that deviate significantly from a department's historical pattern)

## 3. Analytics

- Trend forecasting on Environmental Score (projected trajectory toward annual target)
- Cohort analysis on Social participation (which departments/roles engage most)
- Governance risk heatmap across departments over time

## 4. IoT

- Direct integration with smart meters / fleet telematics to feed Carbon Transactions automatically, replacing manual entry entirely
- Real-time energy consumption dashboards per facility

## 5. Carbon Prediction

- ML model predicting next-quarter emissions based on operational growth plans, feeding into Environmental Goal target-setting

## 6. Mobile App

- Native or React Native companion app focused on Gamification (Challenges, Badges, Leaderboard) — the highest-engagement module, best suited to mobile-first usage patterns

## 7. ERP Integration

- Two-way sync with existing ERP (Odoo, SAP) so Purchase Orders, Manufacturing runs, and Expense records feed Carbon Transactions without duplicate data entry
- Single sign-on with existing organizational identity provider

## 8. Scalability

- Move score computation from synchronous request-time fallback to a proper job queue (BullMQ/Redis) as data volume grows
- Read replicas for Reports module once dashboard query load increases
- Multi-tenant architecture if EcoSphere is offered to multiple organizations rather than deployed per-company

---
**End of documentation set.** Return to [00_PROJECT_OVERVIEW.md](./00_PROJECT_OVERVIEW.md) for the full index.
