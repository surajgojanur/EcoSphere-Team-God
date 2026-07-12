import {
  Award,
  BarChart3,
  Bell,
  Building2,
  ClipboardCheck,
  Flag,
  Gauge,
  Gift,
  Leaf,
  LineChart,
  ListChecks,
  Medal,
  NotebookTabs,
  ScrollText,
  Settings,
  ShieldCheck,
  Sprout,
  Target,
  Trophy,
  Users,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: Gauge,
        description: "Executive ESG snapshot"
      }
    ]
  },
  {
    label: "Environmental",
    items: [
      {
        label: "Emission Factors",
        path: "/environmental/emission-factors",
        icon: Leaf,
        description: "Factors and units"
      },
      {
        label: "Carbon Transactions",
        path: "/environmental/carbon-transactions",
        icon: LineChart,
        description: "Operational carbon logs"
      },
      {
        label: "Environmental Goals",
        path: "/environmental/goals",
        icon: Target,
        description: "Goal progress"
      }
    ]
  },
  {
    label: "Social",
    items: [
      {
        label: "CSR Activities",
        path: "/social/csr-activities",
        icon: Users,
        description: "Employee activities"
      },
      {
        label: "Participations",
        path: "/social/participations",
        icon: ClipboardCheck,
        description: "Approval queue"
      }
    ]
  },
  {
    label: "Gamification",
    items: [
      {
        label: "Challenges",
        path: "/gamification/challenges",
        icon: Trophy,
        description: "Sustainability challenges"
      },
      {
        label: "Badges",
        path: "/gamification/badges",
        icon: Award,
        description: "Unlockable recognition"
      },
      {
        label: "Rewards",
        path: "/gamification/rewards",
        icon: Gift,
        description: "Reward catalog"
      },
      {
        label: "Leaderboard",
        path: "/gamification/leaderboard",
        icon: Medal,
        description: "Employee ranking"
      }
    ]
  },
  {
    label: "Governance",
    items: [
      {
        label: "Policies",
        path: "/governance/policies",
        icon: ScrollText,
        description: "Policy lifecycle"
      },
      {
        label: "Audits",
        path: "/governance/audits",
        icon: NotebookTabs,
        description: "Audit planning"
      },
      {
        label: "Compliance",
        path: "/governance/compliance",
        icon: ShieldCheck,
        description: "Compliance issues"
      }
    ]
  },
  {
    label: "Operations",
    items: [
      {
        label: "Reports",
        path: "/reports",
        icon: BarChart3,
        description: "Fixed ESG reports"
      },
      {
        label: "Notifications",
        path: "/notifications",
        icon: Bell,
        description: "In-app alerts"
      },
      {
        label: "Departments",
        path: "/admin/departments",
        icon: Building2,
        description: "Department settings"
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: ListChecks,
        description: "Activity categories"
      },
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
        description: "ESG configuration"
      }
    ]
  }
];

export const topModules = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Environmental", path: "/environmental/emission-factors" },
  { label: "Social", path: "/social/csr-activities" },
  { label: "Governance", path: "/governance/policies" },
  { label: "Gamification", path: "/gamification/challenges" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" }
];

export const routeTitles: Record<string, { title: string; eyebrow: string; description: string }> = {
  "/login": {
    title: "Log in",
    eyebrow: "Authentication",
    description: "Access the ESG command center."
  },
  "/register": {
    title: "Register",
    eyebrow: "Authentication",
    description: "Create an employee account for ESG participation."
  },
  "/dashboard": {
    title: "ESG Command Center",
    eyebrow: "Dashboard",
    description: "Monitor ESG health, risk, participation, and report readiness from one operating view."
  },
  "/environmental/emission-factors": {
    title: "Emission Factors",
    eyebrow: "Environmental",
    description: "Maintain the measurement references used to interpret carbon activity."
  },
  "/environmental/carbon-transactions": {
    title: "Carbon Transactions",
    eyebrow: "Environmental",
    description: "Review operational carbon activity by department, source, quantity, and date."
  },
  "/environmental/goals": {
    title: "Environmental Goals",
    eyebrow: "Environmental",
    description: "Track sustainability targets, deadlines, ownership, and progress risk."
  },
  "/social/csr-activities": {
    title: "CSR Activities",
    eyebrow: "Social",
    description: "Discover and manage employee participation in sustainability initiatives."
  },
  "/social/participations": {
    title: "Participations",
    eyebrow: "Social",
    description: "Review participation status, evidence, and approval decisions."
  },
  "/gamification/challenges": {
    title: "Challenges",
    eyebrow: "Gamification",
    description: "Encourage focused ESG actions through structured participation goals."
  },
  "/gamification/badges": {
    title: "Badges",
    eyebrow: "Gamification",
    description: "Recognize meaningful employee contribution to sustainability outcomes."
  },
  "/gamification/rewards": {
    title: "Rewards",
    eyebrow: "Gamification",
    description: "Browse responsible recognition options tied to employee contribution."
  },
  "/gamification/leaderboard": {
    title: "Leaderboard",
    eyebrow: "Gamification",
    description: "Compare participation momentum across employees and departments."
  },
  "/governance/policies": {
    title: "Policies",
    eyebrow: "Governance",
    description: "Manage governance requirements, acknowledgement status, and policy context."
  },
  "/governance/audits": {
    title: "Audits",
    eyebrow: "Governance",
    description: "Review audit scope, ownership, timing, findings, and follow-up."
  },
  "/governance/compliance": {
    title: "Compliance Issues",
    eyebrow: "Governance",
    description: "Track severity, ownership, due dates, and resolution of governance risk."
  },
  "/reports": {
    title: "Reports",
    eyebrow: "Reports",
    description: "Turn ESG activity into executive-ready environmental, social, governance, and summary reports."
  },
  "/notifications": {
    title: "Notifications",
    eyebrow: "Operations",
    description: "Review important updates, approvals, risks, and completed actions."
  },
  "/admin/departments": {
    title: "Departments",
    eyebrow: "Administration",
    description: "Maintain the organizational structure used across ESG reporting."
  },
  "/admin/categories": {
    title: "Categories",
    eyebrow: "Administration",
    description: "Organize activities, challenges, and records into consistent categories."
  },
  "/settings": {
    title: "Settings",
    eyebrow: "Administration",
    description: "Configure ESG preferences, notification behavior, and system defaults."
  }
};

export function getRouteMeta(pathname: string) {
  return routeTitles[pathname] ?? {
    title: "Page not found",
    eyebrow: "404",
    description: "The requested EcoSphere route does not exist."
  };
}

export function getBreadcrumbs(pathname: string) {
  const meta = getRouteMeta(pathname);
  return ["EcoSphere", meta.eyebrow, meta.title].filter(Boolean);
}

export const BrandIcon = Sprout;
