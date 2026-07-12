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

---
**Next:** [12_DEPLOYMENT.md](./12_DEPLOYMENT.md)
