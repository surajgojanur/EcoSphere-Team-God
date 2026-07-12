export type SummaryCard = {
  label: string;
  value: string;
  change: string;
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

export function getDashboardPreview() {
  return {
    summaryCards: [
      {
        label: "Overall ESG Score",
        value: "84.2",
        change: "+6.4 this quarter",
        tone: "overall"
      },
      {
        label: "Environmental",
        value: "79",
        change: "Fleet goals improving",
        tone: "environmental"
      },
      {
        label: "Social",
        value: "88",
        change: "CSR participation high",
        tone: "social"
      },
      {
        label: "Governance",
        value: "86",
        change: "2 open issues",
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
    } satisfies ChallengePreview
  };
}
