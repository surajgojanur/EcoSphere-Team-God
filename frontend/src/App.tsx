import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { IntegratedResourcePage } from "./pages/IntegratedResourcePage";
import { AuthPage } from "./pages/AuthPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute, PublicOnlyRoute, RequireRole } from "./auth/routes";

const placeholderRoutes = [
  "/environmental/emission-factors",
  "/environmental/carbon-transactions",
  "/environmental/goals",
  "/social/csr-activities",
  "/social/participations",
  "/gamification/challenges",
  "/gamification/badges",
  "/gamification/rewards",
  "/gamification/leaderboard",
  "/governance/policies",
  "/governance/audits",
  "/governance/compliance",
  "/reports",
  "/notifications",
  "/admin/departments",
  "/admin/categories",
  "/settings"
];

function ShellRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>;
}

function PlaceholderRoute() {
  const location = useLocation();
  const adminOnly = ["/admin/departments", "/admin/categories", "/settings"];
  const content = <IntegratedResourcePage path={location.pathname} />;
  return adminOnly.includes(location.pathname) ? <RequireRole allowed={["ADMIN"]}>{content}</RequireRole> : content;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicOnlyRoute><AuthPage mode="login" /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><AuthPage mode="register" /></PublicOnlyRoute>} />
      <Route
        path="/dashboard"
        element={
          <ShellRoute>
            <DashboardPage />
          </ShellRoute>
        }
      />
      {placeholderRoutes.map((path) => (
        <Route
          key={path}
          path={path}
          element={
            <ShellRoute>
              <PlaceholderRoute />
            </ShellRoute>
          }
        />
      ))}
      <Route
        path="*"
        element={
          <ShellRoute>
            <NotFoundPage />
          </ShellRoute>
        }
      />
    </Routes>
  );
}

export default App;
