import { lazy, Suspense } from "react";
import { Zap } from "lucide-react";
import { Card } from "../ui/primitives";
import type { GamificationPreview } from "../../mocks/dashboard";

const XPTreeGrowthVisual = lazy(() =>
  import("./XPTreeGrowthVisual").then((module) => ({ default: module.XPTreeGrowthVisual }))
);

export function XPProgressCard({
  xp,
  progress
}: {
  xp: GamificationPreview["xp"];
  progress: number;
}) {
  const previousProgress = getProgress(xp.previousEarned, xp.target);
  const deltaXp = Math.max(xp.earned - xp.previousEarned, 0);
  const stage = getTreeStage(progress);

  return (
    <Card className="game-reveal relative overflow-hidden" density="spacious" variant="raised">
      <div className="absolute right-5 top-5 hidden h-12 w-12 place-items-center rounded-[var(--radius-sm)] bg-[var(--status-success-bg)] text-[var(--status-success-text)] sm:grid">
        <Zap aria-hidden="true" className="h-5 w-5" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-green)]">Active XP loop</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="xp-number metric-value">{xp.earned.toLocaleString()}</span>
            <span className="pb-1 text-sm text-[var(--text-secondary)]">/ {xp.target.toLocaleString()} XP</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            XP gives employees a visible path from approved ESG contribution to recognition, while keeping the operating view measurable.
          </p>

          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-3 text-sm">
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
              <p className="metadata-text">Previous XP</p>
              <p className="mt-2 text-lg font-semibold text-white">{xp.previousEarned.toLocaleString()}</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
              <p className="metadata-text">XP growth</p>
              <p className="mt-2 text-lg font-semibold text-white">+{deltaXp.toLocaleString()}</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
              <p className="metadata-text">Streak</p>
              <p className="mt-2 text-lg font-semibold text-white">{xp.streak} days</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
              <p className="metadata-text">Completed</p>
              <p className="mt-2 text-lg font-semibold text-white">{xp.completedChallenges}</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<TreeGrowthFallback currentProgress={progress} previousProgress={previousProgress} stage={stage} deltaXp={deltaXp} />}>
          <XPTreeGrowthVisual
            currentProgress={progress}
            previousProgress={previousProgress}
            stage={stage}
            deltaXp={deltaXp}
          />
        </Suspense>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-label={`${progress}% XP progress`}>
        <div
          className="xp-fill h-full rounded-full bg-[linear-gradient(90deg,var(--accent-green),var(--accent-blue),var(--accent-violet))]"
          style={{ transform: `scaleX(${progress / 100})`, transformOrigin: "left center" }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <span>{progress}% toward target</span>
        <span>{Math.max(xp.target - xp.earned, 0).toLocaleString()} XP remaining</span>
      </div>
    </Card>
  );
}

function TreeGrowthFallback({
  currentProgress,
  previousProgress,
  stage,
  deltaXp
}: {
  currentProgress: number;
  previousProgress: number;
  stage: string;
  deltaXp: number;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--status-success-border)] bg-[linear-gradient(180deg,var(--status-success-bg),rgba(79,155,255,0.08))] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="metadata-text">Tree growth</p>
          <p className="mt-1 text-sm font-medium text-white">{stage}</p>
        </div>
      </div>

      <div className="relative mt-3 aspect-square min-h-44 overflow-hidden rounded-[var(--radius-sm)] bg-[radial-gradient(circle_at_center,var(--surface-raised),transparent_68%)] sm:min-h-60 xl:min-h-64">
        <div className="absolute bottom-[12%] left-1/2 w-16 -translate-x-1/2 rounded-t-full bg-[var(--status-success-bg)]" style={{ height: `${Math.max(currentProgress, 8)}%` }} />
      </div>

      <div className="mt-4">
        <div className="relative h-3 rounded-full bg-[var(--surface-muted)]" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[rgba(255,255,255,0.18)]"
            style={{ width: `${previousProgress}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--accent-green),var(--accent-blue))]"
            style={{ width: `${currentProgress}%` }}
          />
          <span
            className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-white"
            style={{ left: `calc(${previousProgress}% - 2px)` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[var(--text-muted)]">
          <span>{previousProgress}% previous</span>
          <span className="text-center">+{deltaXp.toLocaleString()} XP</span>
          <span className="text-right">{currentProgress}% current</span>
        </div>
      </div>
    </div>
  );
}

function getProgress(value: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
}

function getTreeStage(progress: number) {
  if (progress <= 0) {
    return "Seed";
  }

  if (progress < 34) {
    return "Low growth";
  }

  if (progress < 67) {
    return "Mid growth";
  }

  return "High growth";
}
