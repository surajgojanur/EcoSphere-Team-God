# 11 — UI Guidelines

> Related: [04_FRONTEND_PAGES](./04_FRONTEND_PAGES.md)
> Base: dark theme, matches provided wireframe exactly.

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#111318` | App background |
| `--bg-surface` | `#1B1E25` | Cards, panels |
| `--bg-surface-alt` | `#22252E` | Table row alt, nested panels |
| `--border` | `#2E313A` | Hairlines |
| `--text-primary` | `#E8E9ED` | Primary text |
| `--text-secondary` | `#9A9DA8` | Muted text |
| `--accent-green` | `#3FCF6E` | Environmental score, Active status, success |
| `--accent-blue` | `#4F9BFF` | Overall ESG score, links |
| `--accent-purple` | `#9B7BFF` | Governance score |
| `--accent-orange` | `#FF9F43` | Gamification, warnings, Draft status |
| `--accent-red` | `#FF5C5C` | High severity, overdue, rejected |
| `--accent-yellow` | `#F5C542` | Pending status |

## 2. Typography

| Style | Size | Weight |
|---|---|---|
| Page title | 22px | 500 |
| Section header | 18px | 500 |
| Card title | 16px | 500 |
| Body | 14px | 400 |
| Table cell / secondary | 13px | 400 |
| Badge/pill text | 12px | 500 |

Font: system sans-serif stack (`-apple-system, "Segoe UI", Roboto, sans-serif`).

## 3. Spacing

8px base unit: `4, 8, 12, 16, 24, 32px`. Card padding: `20px`. Page gutter: `24px` desktop, `16px` mobile.

## 4. Buttons

| Variant | Usage | Style |
|---|---|---|
| Primary | New X, Join, Approve | filled accent color, white text |
| Secondary | Edit, Export | outlined, `--border` |
| Danger | Delete, Reject | filled `--accent-red` |
| Ghost | Cancel, tab items | transparent, text only |

All buttons: `border-radius: 8px`, `padding: 8px 16px`, disabled state at 40% opacity + `cursor: not-allowed`.

## 5. Cards

`border-radius: 12px`, `background: var(--bg-surface)`, `border: 1px solid var(--border)`, `padding: 20px`. Score cards use a colored left accent border (4px) matching the score's category color.

## 6. Tables

Header row: `--bg-surface-alt`, uppercase 12px labels, `--text-secondary`. Rows: hover state `--bg-surface-alt` at 50% opacity. Row actions (View/Edit/Delete) right-aligned, icon-only with tooltip.

## 7. Badges / Status Pills

`border-radius: 12px` (pill), `padding: 2px 10px`, `font-size: 12px`, `font-weight: 500`. Background = accent color at 15% opacity, text = full accent color (never pure black/white on colored fill).

| Status | Color |
|---|---|
| Active / Approved / Completed / Resolved | green |
| Pending / Under Review / Draft | yellow / orange |
| Rejected / Open / High severity | red |
| Inactive / Archived | gray |

## 8. Charts

Line chart (Emissions Trend): single green line, no fill, 2px stroke, dot markers on hover only. Bar chart (Department Ranking): single-color bars (`--accent-blue`), rounded top corners (`rx=4`). Use Recharts on the frontend.

## 9. Forms

Label above input, 13px `--text-secondary`. Input: `background: var(--bg-surface-alt)`, `border: 1px solid var(--border)`, `border-radius: 8px`, `padding: 10px 12px`. Focus state: border becomes `--accent-blue`. Error state: border `--accent-red` + helper text below in red.

## 10. Icons

Tabler outline icon set, 18–20px inline, matched to sidebar sections (e.g. `ti-leaf` Environmental, `ti-users` Social, `ti-shield-check` Governance, `ti-trophy` Gamification, `ti-chart-bar` Reports, `ti-settings` Settings).

## 11. Responsive Grid

Desktop: 12-column grid, sidebar fixed 240px. Tablet: sidebar collapses to icon-only rail. Mobile: sidebar becomes a drawer, top tab strip becomes horizontally scrollable.

## 12. Dark Theme

Dark is the only theme in MVP (per wireframe). All colors above are already dark-mode values — no separate light palette needed for the hackathon.

## 13. Accessibility

- All interactive elements keyboard-reachable, visible focus ring (`outline: 2px solid var(--accent-blue)`)
- Status conveyed by badge text, never color alone
- Charts include a text-based data table alternative or `aria-label` summary
- Minimum contrast ratio 4.5:1 for body text against backgrounds

## 14. GSAP Architecture

- GSAP is registered once in `frontend/src/lib/gsap.ts`.
- Components import the configured `gsap` and `useGSAP` from that module only.
- Use `useGSAP()` with a React ref scope for component animation.
- Do not register GSAP plugins inside individual components.
- Use `contextSafe()` for pointer, click, timeout or delayed callbacks that create animations after hook execution.
- Use `revertOnUpdate` when route or state changes rebuild an animation.
- ScrollTrigger is not used in Phase 1; add it only for long pages or meaningful section-based reveals.

## 15. Motion Tokens

Motion constants live in `frontend/src/styles/motion.ts`:

- `duration.fast`, `duration.normal`, `duration.slow`
- `stagger.tight`, `stagger.normal`, `stagger.relaxed`
- `ease.enter`, `ease.exit`, `ease.emphasis`
- `distance.small`, `distance.medium`, `distance.large`
- `scale.hover`, `scale.press`

Use these tokens rather than ad hoc animation numbers.

## 16. Reduced-Motion Rules

- Every GSAP animation must use `gsap.matchMedia()` for `prefers-reduced-motion`.
- Reduced motion removes large travel, tilt, parallax and continuous motion.
- Reduced motion may use short opacity transitions or immediate visibility.
- Important content must never remain hidden if animation setup fails.
- Focus outlines must not be animated away.

## 17. Component Motion Patterns

- App shell: one coordinated timeline for shell, brand, nav, header and dashboard cards.
- Page transitions: short y/opacity reveal scoped to route content.
- Sidebar active state: animate the active indicator without layout shift.
- Drawer/modal: animate backdrop and panel together; Escape and backdrop click must close.
- Cards: desktop pointer devices may use subtle lift/tilt; touch and reduced motion remain static.
- Buttons: GSAP hover/press feedback is secondary to CSS focus-visible states.
- Health/status changes: restrained color/label transition only; no infinite pulsing.

## 18. Cleanup Rules

- Let `useGSAP` context revert animations on unmount.
- Remove all custom event listeners in returned cleanup functions.
- Do not leave orphaned timelines, listeners or ScrollTriggers after route changes.
- Avoid global selectors; select through a component scope or concrete refs.
- Guard nullable refs before passing them to GSAP.

## 19. Animation Anti-Patterns

- Do not add animation because GSAP is available.
- Do not use continuous floating on every card.
- Do not use large horizontal sweeps or rapid flashing.
- Do not block buttons, forms or navigation until animation completes.
- Do not use ScrollTrigger on every CRUD page.
- Do not animate layout-heavy properties when transform/opacity can solve the problem.
- Do not make gamification motion dominate the enterprise ERP interface.

---
**Next:** [12_DEPLOYMENT.md](./12_DEPLOYMENT.md)
