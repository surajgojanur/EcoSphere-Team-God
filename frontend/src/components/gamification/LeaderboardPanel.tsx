import { BadgeCheck, Medal, Zap } from "lucide-react";
import { Card, HighlightedHeadingText } from "../ui/primitives";
import type { GamificationPreview } from "../../mocks/dashboard";

export function LeaderboardPanel({
  leaderboard
}: {
  leaderboard: GamificationPreview["leaderboard"];
}) {
  return (
    <Card className="game-reveal" density="compact" variant="nested">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="heading-copy text-xl font-bold text-white">
            <HighlightedHeadingText title="Leaderboard momentum" highlightClassName="heading-highlight-sm" />
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Ranking highlights momentum without exposing negative comparisons.</p>
        </div>
        <Medal aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-orange)]" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3">
        {leaderboard.map((employee) => (
          <div key={employee.name} className="leader-row flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--status-high-bg)] text-sm font-semibold text-[var(--status-high-text)]">
              {employee.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">{employee.name}</p>
                {employee.rank === 1 ? <BadgeCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-green)]" /> : null}
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{employee.department}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-[var(--accent-green)]">
              <Zap aria-hidden="true" className="h-4 w-4" />
              {employee.xp.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
