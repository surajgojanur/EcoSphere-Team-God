import { Badge, Card, HighlightedHeadingText } from "../ui/primitives";
import type { GamificationPreview } from "../../mocks/dashboard";

const lifecycleTone = {
  complete: "success",
  active: "info",
  pending: "neutral"
} as const;

export function ChallengeTimeline({
  lifecycle
}: {
  lifecycle: GamificationPreview["lifecycle"];
}) {
  return (
    <Card className="game-reveal" density="compact" variant="nested">
      <div className="mb-4">
        <h3 className="heading-copy text-xl font-bold text-white">
          <HighlightedHeadingText title="Challenge lifecycle" highlightClassName="heading-highlight-sm" />
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Clear states keep challenge participation auditable from draft to completion.</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
        {lifecycle.map((step, index) => (
          <div key={step.label} className="timeline-step relative rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-3">
            <div className="flex items-start justify-between gap-3">
              <Badge tone={lifecycleTone[step.status]}>{step.status}</Badge>
              <span className="text-xs font-medium text-[var(--text-muted)]">0{index + 1}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{step.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
