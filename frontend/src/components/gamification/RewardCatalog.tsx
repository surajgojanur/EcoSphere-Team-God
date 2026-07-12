import { Gift } from "lucide-react";
import { Badge, Card, HighlightedHeadingText } from "../ui/primitives";
import type { GamificationPreview } from "../../mocks/dashboard";

export function RewardCatalog({
  rewards
}: {
  rewards: GamificationPreview["rewards"];
}) {
  return (
    <Card className="game-reveal" density="compact">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="heading-copy text-xl font-bold text-white">
            <HighlightedHeadingText title="Reward catalog" highlightClassName="heading-highlight-sm" />
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Responsible redemption options without turning the workspace into a store.</p>
        </div>
        <Gift aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-violet)]" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-2">
        {rewards.map((reward) => (
          <div key={reward.name} className="reward-chip rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-white">{reward.name}</p>
              <Badge tone="info">{reward.stock}</Badge>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{reward.points.toLocaleString()} points</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
