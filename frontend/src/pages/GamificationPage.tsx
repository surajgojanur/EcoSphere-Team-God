import { Award, Gift, Medal, Plus, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getRouteMeta } from "../app/navigation";
import { BadgeGrid } from "../components/gamification/BadgeGrid";
import { ChallengeTimeline } from "../components/gamification/ChallengeTimeline";
import { GamificationShowcase } from "../components/gamification/GamificationShowcase";
import { LeaderboardPanel } from "../components/gamification/LeaderboardPanel";
import { RewardCatalog } from "../components/gamification/RewardCatalog";
import { XPProgressCard } from "../components/gamification/XPProgressCard";
import { Badge, Button, Card, PageHeader, SectionHeader } from "../components/ui/primitives";
import { getDashboardPreview } from "../mocks/dashboard";

const tabs = [
  { label: "Challenges", path: "/gamification/challenges", icon: Trophy },
  { label: "Badges", path: "/gamification/badges", icon: Award },
  { label: "Rewards", path: "/gamification/rewards", icon: Gift },
  { label: "Leaderboard", path: "/gamification/leaderboard", icon: Medal }
];

export function GamificationPage({ path }: { path: string }) {
  const navigate = useNavigate();
  const meta = getRouteMeta(path);
  const data = getDashboardPreview().gamification;
  const xpProgress = Math.min(100, Math.max(0, Math.round((data.xp.earned / data.xp.target) * 100)));
  const activeTab = useMemo(() => tabs.find((tab) => tab.path === path) ?? tabs[0], [path]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        actions={
          <Button onClick={() => navigate("/gamification/challenges")}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            New challenge
          </Button>
        }
      />

      <Card className="page-reveal" density="compact">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gamification sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.path === activeTab.path;
            return (
              <button
                key={tab.path}
                aria-selected={isActive}
                className={`inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                  isActive
                    ? "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]"
                    : "border-[var(--border)] bg-[var(--surface-nested)] text-[var(--text-secondary)] hover:border-[var(--focus-ring)] hover:text-[var(--text-primary)]"
                }`}
                role="tab"
                type="button"
                onClick={() => navigate(tab.path)}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {path === "/gamification/challenges" ? (
        <GamificationShowcase data={data} onOpenLeaderboard={() => navigate("/gamification/leaderboard")} />
      ) : null}

      {path === "/gamification/badges" ? (
        <div className="grid gap-4">
          <XPProgressCard xp={data.xp} progress={xpProgress} />
          <BadgeGrid badges={data.badges} />
          <Card className="page-reveal" variant="nested">
            <SectionHeader title="Auto-award context" description="Badge recognition is meaningful only when the rule is understandable and tied to approved ESG participation." />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
              {data.badges.map((badge) => (
                <div key={badge.name} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-3">
                  <Badge tone={badge.tone}>{badge.unlockRule}</Badge>
                  <p className="mt-3 text-sm font-medium text-white">{badge.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {path === "/gamification/rewards" ? (
        <div className="grid gap-4 2xl:grid-cols-[0.9fr_1.1fr]">
          <RewardCatalog rewards={data.rewards} />
          <XPProgressCard xp={data.xp} progress={xpProgress} />
        </div>
      ) : null}

      {path === "/gamification/leaderboard" ? (
        <div className="grid gap-4">
          <LeaderboardPanel leaderboard={data.leaderboard} />
          <ChallengeTimeline lifecycle={data.lifecycle} />
        </div>
      ) : null}
    </div>
  );
}
