import { ArrowUpRight, CalendarClock, FileText, Leaf, Plus, ShieldAlert, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardPreview, type SummaryCard } from "../mocks/dashboard";
import { AnimatedNumber, MotionCard, StaggerGroup } from "../components/motion/Motion";
import { Badge, Button, Card, PageHeader, SectionHeader } from "../components/ui/primitives";

const toneClass: Record<SummaryCard["tone"], string> = {
  overall: "border-l-[var(--accent-blue)]",
  environmental: "border-l-[var(--accent-green)]",
  social: "border-l-[var(--accent-violet)]",
  governance: "border-l-[var(--accent-orange)]"
};

const alertToneClass = {
  danger: "bg-[rgba(255,92,92,0.12)] text-[var(--accent-red)]",
  warning: "bg-[rgba(245,197,66,0.12)] text-[var(--accent-yellow)]",
  info: "bg-[rgba(79,155,255,0.12)] text-[var(--accent-blue)]"
};

const alertStatusLabel = {
  danger: "High",
  warning: "At risk",
  info: "Review"
};

export function DashboardPage() {
  const data = getDashboardPreview();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="ESG Command Center"
        description="A live operating view for ESG health, department performance, governance risk, participation, and management-ready reporting."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/reports")}>
              <FileText aria-hidden="true" className="h-4 w-4" />
              Reports
            </Button>
            <Button onClick={() => navigate("/environmental/carbon-transactions")}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Log carbon
            </Button>
          </>
        }
      />

      <StaggerGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" childSelector=".dashboard-card">
        {data.summaryCards.map((card) => (
          <MotionCard key={card.label} className="dashboard-card">
            <Card className={`h-full border-l-4 ${toneClass[card.tone]}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
                <Badge tone={card.tone === "governance" ? "warning" : "success"}>{card.change}</Badge>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">
                <AnimatedNumber value={card.value} />
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.insight}</p>
            </Card>
          </MotionCard>
        ))}
      </StaggerGroup>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="page-reveal">
          <SectionHeader title="Department performance" description="Compare ESG momentum across teams and identify where attention is needed." />
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
          <SectionHeader title="Attention required" description="Risk, goal, and reporting signals that need review." />
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <div key={alert.label} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${alertToneClass[alert.tone]}`}>
                  <ShieldAlert aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white">{alert.label}</p>
                    <Badge tone={alert.tone}>{alertStatusLabel[alert.tone]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{alert.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="page-reveal">
          <SectionHeader title="Active challenge" description="Employee participation keeps the social score moving." />
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-4">
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
            <p className="mt-3 text-xs text-[var(--text-muted)]">{data.challenge.progress}% progress toward completion</p>
          </div>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Recent activity" description="Operational events that explain ESG score movement." />
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
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="page-reveal">
          <SectionHeader title="Report readiness" description="Management summaries become the closing loop for ESG activity." />
          <div className="grid gap-3 sm:grid-cols-2">
            {data.reportReadiness.map((item) => (
              <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <Badge tone={item.tone}>{item.value}</Badge>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-5" variant="secondary" onClick={() => navigate("/reports")}>
            Open reports
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Next best actions" description="Move from insight to action without leaving the command center." />
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              { label: "Review goals", path: "/environmental/goals", icon: Target },
              { label: "Approve participation", path: "/social/participations", icon: Users },
              { label: "Open carbon logs", path: "/environmental/carbon-transactions", icon: Leaf }
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3 text-left text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
                  type="button"
                  onClick={() => navigate(action.path)}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgba(79,155,255,0.12)] text-[var(--accent-blue)]">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    {action.label}
                  </span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="page-reveal">
        <SectionHeader title="Operating flow" description="Use the command center to move from ESG health to evidence, accountability, and reporting." />
        <div className="grid gap-3 lg:grid-cols-5">
          {data.operatingFlow.map((step) => (
            <button
              key={step.label}
              className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-4 text-left transition-colors hover:border-[var(--accent-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
              type="button"
              onClick={() => navigate(step.path)}
            >
              <span className="text-sm font-medium text-white">{step.label}</span>
              <span className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</span>
              <span className="mt-auto inline-flex pt-4 text-xs font-medium text-[var(--accent-blue)]">
                Open area
                <ArrowUpRight aria-hidden="true" className="ml-1 h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
