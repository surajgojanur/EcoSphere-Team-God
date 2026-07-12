import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { AuthPage } from "./pages/AuthPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
  return <AppShell>{children}</AppShell>;
}

function PlaceholderRoute() {
  const location = useLocation();
  return <PlaceholderPage path={location.pathname} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
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
