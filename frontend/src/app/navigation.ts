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
    description: "Phase 2 will connect this page to JWT authentication."
  },
  "/register": {
    title: "Register",
    eyebrow: "Authentication",
    description: "Employee-only registration placeholder for Phase 2."
  },
  "/dashboard": {
    title: "ESG Command Center",
    eyebrow: "Dashboard",
    description: "A polished Phase 1 preview using mock data until dashboard APIs are ready."
  },
  "/environmental/emission-factors": {
    title: "Emission Factors",
    eyebrow: "Environmental",
    description: "Manage factor values and units after the API contract is implemented."
  },
  "/environmental/carbon-transactions": {
    title: "Carbon Transactions",
    eyebrow: "Environmental",
    description: "Future transaction tables will rely on server-side emission calculations."
  },
  "/environmental/goals": {
    title: "Environmental Goals",
    eyebrow: "Environmental",
    description: "Goal progress placeholders are ready for Phase 4 implementation."
  },
  "/social/csr-activities": {
    title: "CSR Activities",
    eyebrow: "Social",
    description: "Activity cards, joining states, and approvals arrive in Phase 5."
  },
  "/social/participations": {
    title: "Participations",
    eyebrow: "Social",
    description: "Approval queue shell for ESG manager workflows."
  },
  "/gamification/challenges": {
    title: "Challenges",
    eyebrow: "Gamification",
    description: "Challenge state filters and participation flows are planned for Phase 5."
  },
  "/gamification/badges": {
    title: "Badges",
    eyebrow: "Gamification",
    description: "Badge gallery shell, with unlock logic remaining server-owned."
  },
  "/gamification/rewards": {
    title: "Rewards",
    eyebrow: "Gamification",
    description: "Reward redemption UI will never own stock or point deduction rules."
  },
  "/gamification/leaderboard": {
    title: "Leaderboard",
    eyebrow: "Gamification",
    description: "Leaderboard presentation placeholder for API-backed rankings."
  },
  "/governance/policies": {
    title: "Policies",
    eyebrow: "Governance",
    description: "Policy acknowledgement flows are reserved for governance implementation."
  },
  "/governance/audits": {
    title: "Audits",
    eyebrow: "Governance",
    description: "Audit lifecycle UI will follow documented role permissions."
  },
  "/governance/compliance": {
    title: "Compliance Issues",
    eyebrow: "Governance",
    description: "Compliance ownership and overdue flags remain backend authoritative."
  },
  "/reports": {
    title: "Reports",
    eyebrow: "Reports",
    description: "Fixed report shells for environmental, social, governance, and ESG summary."
  },
  "/notifications": {
    title: "Notifications",
    eyebrow: "Operations",
    description: "Notification list shell for future API polling."
  },
  "/admin/departments": {
    title: "Departments",
    eyebrow: "Administration",
    description: "Department CRUD placeholder for Admin-only settings."
  },
  "/admin/categories": {
    title: "Categories",
    eyebrow: "Administration",
    description: "Category CRUD placeholder for CSR and challenge classification."
  },
  "/settings": {
    title: "Settings",
    eyebrow: "Administration",
    description: "ESG configuration and notification preference shell."
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
