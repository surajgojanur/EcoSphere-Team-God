import { ArrowUpRight, CalendarClock, FileText, Plus, ShieldAlert } from "lucide-react";
import { getDashboardPreview, type SummaryCard } from "../mocks/dashboard";
import { AnimatedNumber, MotionCard, StaggerGroup } from "../components/motion/Motion";
import { Badge, Button, Card, PageHeader, SectionHeader } from "../components/ui/primitives";

const toneClass: Record<SummaryCard["tone"], string> = {
  overall: "border-l-[var(--accent-blue)]",
  environmental: "border-l-[var(--accent-green)]",
  social: "border-l-[var(--accent-violet)]",
  governance: "border-l-[var(--accent-orange)]"
};

export function DashboardPage() {
  const data = getDashboardPreview();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="ESG Command Center"
        description="A Phase 1 shell preview with mock presentation data. Score calculation, carbon math, XP, rewards, compliance and RBAC remain backend-owned."
        actions={
          <>
            <Button variant="secondary">
              <FileText aria-hidden="true" className="h-4 w-4" />
              Reports
            </Button>
            <Button>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Log data
            </Button>
          </>
        }
      />

      <StaggerGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" childSelector=".dashboard-card">
        {data.summaryCards.map((card) => (
          <MotionCard key={card.label} className="dashboard-card">
            <Card className={`h-full border-l-4 ${toneClass[card.tone]}`}>
              <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                <AnimatedNumber value={card.value} />
              </p>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{card.change}</p>
            </Card>
          </MotionCard>
        ))}
      </StaggerGroup>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="page-reveal">
          <SectionHeader title="Department ranking" description="Preview of API-backed department score ordering." />
          <div className="space-y-4" aria-label="Department ESG ranking">
            {data.departments.map((department) => (
              <div key={department.department}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white">{department.department}</span>
                  <span className="text-[var(--text-secondary)]">
                    {department.score} · {department.delta}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-surface-alt)]">
                  <div className="h-2 rounded-full bg-[var(--accent-blue)]" style={{ width: `${department.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Active challenge" description="Gamification preview without client-owned award logic." />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface-alt)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-white">{data.challenge.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{data.challenge.participants} employees participating</p>
              </div>
              <Badge tone="success">{data.challenge.status}</Badge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
              <div className="h-2 rounded-full bg-[var(--accent-green)]" style={{ width: `${data.challenge.progress}%` }} />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">{data.challenge.progress}% mock progress</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="page-reveal">
          <SectionHeader title="Recent activity" description="Future activity log and notification stream." />
          <div className="space-y-3">
            {data.activities.map((activity) => (
              <div key={activity.title} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(63,207,110,0.12)] text-[var(--accent-green)]">
                  {activity.tone === "warning" ? <ShieldAlert aria-hidden="true" className="h-4 w-4" /> : <CalendarClock aria-hidden="true" className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <span className="text-xs text-[var(--text-muted)]">{activity.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Implementation boundary" description="Phase 1 creates the UI foundation only." />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Mock data comes from frontend/src/mocks.",
              "Backend health uses the existing /health endpoint.",
              "Business rules remain server authoritative.",
              "Future pages are routed shells, not hidden work."
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3 text-sm text-[var(--text-secondary)]">
                {item}
              </div>
            ))}
          </div>
          <Button className="mt-5" variant="secondary">
            View roadmap
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
