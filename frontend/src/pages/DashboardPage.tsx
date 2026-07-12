import { ArrowUpRight, CalendarClock, FileText, Leaf, Plus, ShieldAlert, Target, Users } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardPreview, type SummaryCard } from "../mocks/dashboard";
import { AnimatedNumber, MotionCard, StaggerGroup } from "../components/motion/Motion";
import { Badge, Button, Card, HighlightedHeadingText, PageHeader, SectionHeader } from "../components/ui/primitives";
import { gsap, useGSAP } from "../lib/gsap";
import { mediaQueries } from "../styles/motion";

const toneClass: Record<SummaryCard["tone"], string> = {
  overall: "border-l-[var(--accent-blue)]",
  environmental: "border-l-[var(--accent-green)]",
  social: "border-l-[var(--accent-violet)]",
  governance: "border-l-[var(--accent-orange)]"
};

const alertToneClass = {
  danger: "bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]",
  warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",
  info: "bg-[var(--status-info-bg)] text-[var(--status-info-text)]"
};

const alertStatusLabel = {
  danger: "High",
  warning: "At risk",
  info: "Review"
};

export function DashboardPage() {
  const data = getDashboardPreview();
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = dashboardRef.current;
      if (!root) {
        return;
      }

      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set(q(".dashboard-parallax-layer"), {
          autoAlpha: 1,
          clearProps: "transform"
        });
      });

      mm.add(mediaQueries.motionSafe, () => {
        gsap.fromTo(
          q(".dashboard-parallax-layer-slow"),
          { yPercent: 10 },
          {
            yPercent: -18,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.8
            }
          }
        );

        gsap.fromTo(
          q(".dashboard-parallax-layer-fast"),
          { yPercent: 18, xPercent: 0 },
          {
            yPercent: -30,
            xPercent: -3,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.65
            }
          }
        );
      });

      return () => mm.revert();
    },
    { scope: dashboardRef }
  );

  return (
    <div ref={dashboardRef} className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="dashboard-parallax-layer dashboard-parallax-layer-slow absolute -left-16 top-6 hidden h-72 w-[72%] rounded-[var(--radius-lg)] border border-[var(--status-info-border)] bg-[linear-gradient(135deg,var(--status-info-bg),transparent_70%)] opacity-60 lg:block" />
        <div className="dashboard-parallax-layer dashboard-parallax-layer-fast absolute -right-24 top-48 hidden h-80 w-80 rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] opacity-45 lg:block" />
        <div className="dashboard-parallax-layer dashboard-parallax-layer-slow absolute left-[10%] top-[38%] hidden h-48 w-[52%] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(29,33,42,0.46)] opacity-70 lg:block" />
        <div className="dashboard-parallax-layer dashboard-parallax-layer-fast absolute right-[6%] top-[58%] hidden h-36 w-72 rounded-[var(--radius-md)] border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] opacity-35 lg:block" />
        <div className="dashboard-parallax-layer dashboard-parallax-layer-slow absolute -bottom-16 left-[24%] hidden h-64 w-[58%] rounded-[var(--radius-lg)] border border-[var(--status-success-border)] bg-[linear-gradient(135deg,transparent,var(--status-success-bg))] opacity-45 lg:block" />
      </div>

      <div className="relative z-10 space-y-6">
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

        <StaggerGroup className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" childSelector=".dashboard-card">
          {data.summaryCards.map((card) => (
            <MotionCard key={card.label} className="dashboard-card">
              <Card className={`h-full border-l-4 ${toneClass[card.tone]}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
                  <Badge tone={card.tone === "governance" ? "warning" : "success"}>{card.change}</Badge>
                </div>
                <p className="metric-value mt-4">
                  <AnimatedNumber value={card.value} />
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.insight}</p>
              </Card>
            </MotionCard>
          ))}
        </StaggerGroup>

      <div className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
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
                <div className="h-2 rounded-full bg-[var(--surface-nested)]">
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
              <div key={alert.label} className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] ${alertToneClass[alert.tone]}`}>
                  <ShieldAlert aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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

      <div className="grid gap-4 2xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="page-reveal">
          <SectionHeader title="Active challenge" description="Employee participation keeps the social score moving." />
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="heading-copy text-xl font-bold text-white">
                  <HighlightedHeadingText title={data.challenge.title} highlightClassName="heading-highlight-sm" />
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{data.challenge.participants} employees participating</p>
              </div>
              <Badge tone="success">{data.challenge.status}</Badge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-[var(--surface-muted)]">
              <div className="h-2 rounded-full bg-[var(--accent-green)]" style={{ width: `${data.challenge.progress}%` }} />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">{data.challenge.progress}% progress toward completion</p>
          </div>
        </Card>

        <Card className="page-reveal">
          <SectionHeader title="Recent activity" description="Operational events that explain ESG score movement." />
          <div className="space-y-3">
            {data.activities.map((activity) => (
              <div key={activity.title} className="flex gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]">
                  {activity.tone === "warning" ? <ShieldAlert aria-hidden="true" className="h-4 w-4" /> : <CalendarClock aria-hidden="true" className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
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

      <div className="grid gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="page-reveal">
          <SectionHeader title="Report readiness" description="Management summaries become the closing loop for ESG activity." />
          <div className="grid gap-3 sm:grid-cols-2">
            {data.reportReadiness.map((item) => (
              <div key={item.label} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
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
          <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            {[
              { label: "Review goals", path: "/environmental/goals", icon: Target },
              { label: "Approve participation", path: "/social/participations", icon: Users },
              { label: "Open carbon logs", path: "/environmental/carbon-transactions", icon: Leaf }
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3 text-left text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--focus-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  type="button"
                  onClick={() => navigate(action.path)}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]">
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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {data.operatingFlow.map((step) => (
            <button
              key={step.label}
              className="flex h-full flex-col rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-4 text-left transition-colors hover:border-[var(--focus-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
    </div>
  );
}
