import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "../api/client";
import { LoadingState, ErrorState, Button } from "../components/ui/primitives";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === "loading") return <LoadingState label="Restoring secure session" />;
  if (auth.status === "unauthenticated") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.status === "loading") return <LoadingState label="Checking session" />;
  if (auth.status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function RequireRole({ allowed, children }: { allowed: UserRole[]; children: ReactNode }) {
  const auth = useAuth();
  if (!auth.user || !allowed.includes(auth.user.role)) return <ForbiddenPage />;
  return <>{children}</>;
}

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <ErrorState title="Access denied" description="Your account does not have permission to open this area." />
      <Button className="mt-4" onClick={() => window.history.back()} variant="secondary">Go back</Button>
    </div>
  );
}

