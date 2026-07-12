export type SummaryCard = {
  label: string;
  value: string;
  change: string;
  insight: string;
  tone: "environmental" | "social" | "governance" | "overall";
};

export type ActivityItem = {
  title: string;
  description: string;
  time: string;
  tone: "success" | "warning" | "info";
};

export type DepartmentRank = {
  department: string;
  score: number;
  delta: string;
};

export type ChallengePreview = {
  title: string;
  status: string;
  progress: number;
  participants: number;
};

export type AlertItem = {
  label: string;
  value: string;
  tone: "danger" | "warning" | "info";
};

export type ReportReadinessItem = {
  label: string;
  value: string;
  tone: "success" | "warning";
};

export type WorkflowStep = {
  label: string;
  description: string;
  path: string;
};

export type GamificationPreview = {
  xp: {
    previousEarned: number;
    earned: number;
    target: number;
    streak: number;
    completedChallenges: number;
  };
  lifecycle: Array<{
    label: string;
    status: "complete" | "active" | "pending";
  }>;
  badges: Array<{
    name: string;
    unlockRule: string;
    tone: "success" | "info" | "warning";
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    department: string;
    xp: number;
  }>;
  rewards: Array<{
    name: string;
    points: number;
    stock: string;
  }>;
};

export function getDashboardPreview() {
  return {
    summaryCards: [
      {
        label: "Overall ESG Score",
        value: "84.2",
        change: "+6.4 this quarter",
        insight: "Healthy performance with governance risk under watch",
        tone: "overall"
      },
      {
        label: "Environmental",
        value: "79",
        change: "Fleet goals improving",
        insight: "Carbon activity is trending toward quarterly target",
        tone: "environmental"
      },
      {
        label: "Social",
        value: "88",
        change: "CSR participation high",
        insight: "Employee engagement is the strongest ESG driver",
        tone: "social"
      },
      {
        label: "Governance",
        value: "86",
        change: "2 open issues",
        insight: "Open compliance items need owner follow-up",
        tone: "governance"
      }
    ] satisfies SummaryCard[],
    activities: [
      {
        title: "Tree Plantation approved",
        description: "24 employee participations moved to approved.",
        time: "12m ago",
        tone: "success"
      },
      {
        title: "Compliance issue assigned",
        description: "Fleet audit finding assigned to Logistics.",
        time: "34m ago",
        tone: "warning"
      },
      {
        title: "Policy acknowledgement opened",
        description: "Updated sustainability policy is ready for review.",
        time: "1h ago",
        tone: "info"
      }
    ] satisfies ActivityItem[],
    departments: [
      { department: "Corporate", score: 91, delta: "+4" },
      { department: "Manufacturing", score: 82, delta: "+7" },
      { department: "Logistics", score: 76, delta: "+2" }
    ] satisfies DepartmentRank[],
    challenge: {
      title: "30-Day Low Carbon Commute",
      status: "Active",
      progress: 64,
      participants: 118
    } satisfies ChallengePreview,
    alerts: [
      {
        label: "High severity issue",
        value: "Fleet audit owner due in 2 days",
        tone: "danger"
      },
      {
        label: "Goal at risk",
        value: "Manufacturing emissions target needs review",
        tone: "warning"
      },
      {
        label: "Report readiness",
        value: "ESG summary ready for manager review",
        tone: "info"
      }
    ] satisfies AlertItem[],
    reportReadiness: [
      { label: "Environmental", value: "Ready", tone: "success" },
      { label: "Social", value: "Ready", tone: "success" },
      { label: "Governance", value: "Needs review", tone: "warning" }
    ] satisfies ReportReadinessItem[],
    operatingFlow: [
      {
        label: "1. Start at ESG health",
        description: "Read overall performance, strongest area, weakest area, and urgent exceptions.",
        path: "/dashboard"
      },
      {
        label: "2. Prove environmental activity",
        description: "Open carbon transactions and goals to connect performance to operational records.",
        path: "/environmental/carbon-transactions"
      },
      {
        label: "3. Review participation",
        description: "Check social activity and approvals so employee effort stays visible and accountable.",
        path: "/social/participations"
      },
      {
        label: "4. Resolve governance risk",
        description: "Follow severity, ownership, and due dates before risk reaches the report.",
        path: "/governance/compliance"
      },
      {
        label: "5. Close with reporting",
        description: "Turn the operating view into management-ready ESG summaries.",
        path: "/reports"
      }
    ] satisfies WorkflowStep[],
    gamification: {
      xp: {
        previousEarned: 2140,
        earned: 2840,
        target: 3600,
        streak: 14,
        completedChallenges: 9
      },
      lifecycle: [
        { label: "Draft", status: "complete" },
        { label: "Active", status: "active" },
        { label: "Under Review", status: "pending" },
        { label: "Completed", status: "pending" }
      ],
      badges: [
        {
          name: "Carbon Cutter",
          unlockRule: "2,500 XP earned",
          tone: "success"
        },
        {
          name: "Proof Builder",
          unlockRule: "5 approved proofs",
          tone: "info"
        },
        {
          name: "Goal Keeper",
          unlockRule: "3 completed challenges",
          tone: "warning"
        }
      ],
      leaderboard: [
        { rank: 1, name: "Aarav Mehta", department: "Logistics", xp: 2840 },
        { rank: 2, name: "Maya Shah", department: "Manufacturing", xp: 2710 },
        { rank: 3, name: "Ishaan Rao", department: "Corporate", xp: 2460 }
      ],
      rewards: [
        { name: "Green commute pass", points: 900, stock: "12 left" },
        { name: "CSR day credit", points: 1400, stock: "5 left" },
        { name: "Eco kit", points: 650, stock: "24 left" }
      ]
    } satisfies GamificationPreview
  };
}
