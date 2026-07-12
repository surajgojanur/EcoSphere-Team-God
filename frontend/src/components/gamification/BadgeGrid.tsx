import { Award, Sparkles } from "lucide-react";
import { Card, HighlightedHeadingText } from "../ui/primitives";
import type { GamificationPreview } from "../../mocks/dashboard";

const badgeToneClass = {
  success: "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
  info: "bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
  warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]"
} as const;

export function BadgeGrid({
  badges
}: {
  badges: GamificationPreview["badges"];
}) {
  return (
    <Card className="game-reveal" density="compact">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="heading-copy text-xl font-bold text-white">
            <HighlightedHeadingText title="Badge unlocks" highlightClassName="heading-highlight-sm" />
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Recognition stays tied to visible contribution rules.</p>
        </div>
        <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-yellow)]" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3">
        {badges.map((badge) => (
          <div key={badge.name} className="badge-token flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] ${badgeToneClass[badge.tone]}`}>
              <Award aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{badge.name}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{badge.unlockRule}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
