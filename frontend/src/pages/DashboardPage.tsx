import { ArrowUpRight, CalendarClock, FileText, Leaf, Plus, ShieldAlert, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApiResource } from "../hooks/useApiResource";
import { AnimatedNumber, MotionCard, StaggerGroup } from "../components/motion/Motion";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, SectionHeader } from "../components/ui/primitives";
import { formatDecimal, formatEmission } from "../utils/format";

const toneClass: Record<string, string> = {
  overall: "border-l-[var(--accent-blue)]",
  environmental: "border-l-[var(--accent-green)]",
  social: "border-l-[var(--accent-violet)]",
  governance: "border-l-[var(--accent-orange)]"
};

export function DashboardPage() {
  const navigate = useNavigate();
  const scores = useApiResource<any>("/dashboard/scores");
  const trend = useApiResource<any[]>("/dashboard/emissions-trend");
  const ranking = useApiResource<any[]>("/dashboard/department-ranking");
  const activity = useApiResource<any[]>("/dashboard/recent-activity");

  if (scores.status === "loading") return <LoadingState label="Loading dashboard" />;
  if (scores.status === "error") return <ErrorState description={scores.error.message} />;

  const summaryCards = [
    { label: "Overall ESG", value: Number(scores.data.overallScore ?? 0), insight: scores.data.hasData ? "Weighted organization score from backend." : "No active employee data yet.", tone: "overall", change: scores.data.hasData ? "Live" : "No data" },
    ...(scores.data.departments?.[0] ? [
      { label: "Environmental", value: Number(scores.data.departments[0].environmentalScore ?? 0), insight: "Average active goal progress.", tone: "environmental", change: scores.data.departments[0].hasEnvironmentalData ? "Has data" : "No data" },
      { label: "Social", value: Number(scores.data.departments[0].socialScore ?? 0), insight: "Approved CSR participation coverage.", tone: "social", change: scores.data.departments[0].hasSocialData ? "Has data" : "No data" },
      { label: "Governance", value: Number(scores.data.departments[0].governanceScore ?? 0), insight: "Severity-weighted compliance score.", tone: "governance", change: "Live" }
    ] : [])
  ];

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
        {summaryCards.map((card) => (
          <MotionCard key={card.label} className="dashboard-card">
            <Card className={`h-full border-l-4 ${toneClass[card.tone]}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
                <Badge tone={card.tone === "governance" ? "warning" : "success"}>{card.change}</Badge>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">
                <AnimatedNumber value={formatDecimal(card.value)} />
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
            {(ranking.status === "success" ? ranking.data : []).map((department) => (
              <div key={department.departmentId}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white">{department.departmentName ?? department.departmentId}</span>
                  <span className="text-[var(--text-secondary)]">
                    {formatDecimal(department.totalScore)} · Rank {department.rank}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-surface-alt)]">
                  <div className="h-2 rounded-full bg-[var(--accent-blue)]" style={{ width: `${Number(department.totalScore ?? 0)}%` }} />
                </div>
              </div>
            ))}
            {ranking.status === "success" && ranking.data.length === 0 ? <EmptyState title="No ranking data" description="Scores will appear after recomputation." /> : null}
          </div>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Attention required" description="Risk, goal, and reporting signals that need review." />
          <div className="space-y-3">
            {(trend.status === "success" ? trend.data.slice(-3) : []).map((alert) => (
              <div key={alert.month} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(79,155,255,0.12)] text-[var(--accent-blue)]">
                  <ShieldAlert aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white">{alert.month}</p>
                    <Badge tone="info">Emissions</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatEmission(alert.emissions)}</p>
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
              <h3 className="text-base font-medium text-white">Live ESG scores</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{scores.data.departments?.length ?? 0} departments scored</p>
              </div>
              <Badge tone="success">{scores.data.hasData ? "Ready" : "No data"}</Badge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
              <div className="h-2 rounded-full bg-[var(--accent-green)]" style={{ width: `${Number(scores.data.overallScore ?? 0)}%` }} />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">{formatDecimal(scores.data.overallScore)} overall score</p>
          </div>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Recent activity" description="Operational events that explain ESG score movement." />
          <div className="space-y-3">
            {(activity.status === "success" ? activity.data : []).map((item) => (
              <div key={item.id} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(63,207,110,0.12)] text-[var(--accent-green)]">
                  <CalendarClock aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white">{item.action}</p>
                    <span className="text-xs text-[var(--text-muted)]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.entityType}</p>
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
            {["Environmental", "Social", "Governance", "ESG summary"].map((item) => (
              <div key={item} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item}</p>
                  <Badge tone="success">API</Badge>
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
          {[
            { label: "Log carbon", description: "Create server-calculated transactions.", path: "/environmental/carbon-transactions" },
            { label: "Review CSR", description: "Approve participation evidence.", path: "/social/participations" },
            { label: "Governance", description: "Track policies and compliance.", path: "/governance/compliance" },
            { label: "Rewards", description: "Redeem points and XP.", path: "/gamification/rewards" },
            { label: "Reports", description: "Export CSV summaries.", path: "/reports" }
          ].map((step) => (
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
