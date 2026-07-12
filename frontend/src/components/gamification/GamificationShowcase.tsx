import { Trophy } from "lucide-react";
import { useRef } from "react";
import type { GamificationPreview } from "../../mocks/dashboard";
import { Button, SectionHeader } from "../ui/primitives";
import { BadgeGrid } from "./BadgeGrid";
import { ChallengeTimeline } from "./ChallengeTimeline";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { RewardCatalog } from "./RewardCatalog";
import { useGamificationAnimation } from "./useGamificationAnimation";
import { XPProgressCard } from "./XPProgressCard";

export function GamificationShowcase({
  data,
  onOpenLeaderboard
}: {
  data: GamificationPreview;
  onOpenLeaderboard?: () => void;
}) {
  const scope = useRef<HTMLElement>(null);
  const xpProgress = Math.min(100, Math.max(0, Math.round((data.xp.earned / data.xp.target) * 100)));

  useGamificationAnimation({
    scope,
    earnedXp: data.xp.earned,
    xpProgress
  });

  return (
    <section ref={scope} className="page-reveal relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-primary)] p-4 shadow-soft sm:p-5">
      <div className="parallax-slow pointer-events-none absolute inset-x-6 top-6 hidden h-28 rounded-[var(--radius-lg)] border border-[var(--status-info-border)] bg-[linear-gradient(135deg,var(--status-info-bg),transparent)] opacity-60 lg:block" />
      <div className="parallax-fast pointer-events-none absolute -right-12 top-20 hidden h-44 w-44 rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] opacity-50 lg:block" />
      <svg className="pointer-events-none absolute inset-x-0 top-16 hidden h-44 w-full text-[var(--accent-green)] opacity-35 lg:block" viewBox="0 0 900 180" fill="none" aria-hidden="true">
        <path className="spark-path" pathLength="1" stroke="currentColor" strokeDasharray="1" strokeDashoffset="1" strokeWidth="2" d="M20 132 C150 24 248 164 360 82 C490 -12 600 190 748 58 C810 2 858 40 890 22" />
      </svg>

      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader title="Gamification engine" description="Challenges, XP, badges, rewards, and leaderboards turn ESG participation into visible momentum." />
          <Button className="game-reveal w-full sm:w-auto" variant="secondary" type="button" onClick={onOpenLeaderboard}>
            <Trophy aria-hidden="true" className="h-4 w-4" />
            Open leaderboard
          </Button>
        </div>

        <div className="mt-2 grid gap-4 2xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4">
            <XPProgressCard xp={data.xp} progress={xpProgress} />
            <ChallengeTimeline lifecycle={data.lifecycle} />
          </div>

          <div className="grid gap-4">
            <BadgeGrid badges={data.badges} />
            <RewardCatalog rewards={data.rewards} />
          </div>
        </div>

        <div className="mt-4">
          <LeaderboardPanel leaderboard={data.leaderboard} />
        </div>
      </div>
    </section>
  );
}
