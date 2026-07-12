import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest, setUnauthorizedHandler, type ApiError, type AuthUser } from "../api/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthSession = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  error: ApiError | Error | null;
  login(input: { email: string; password: string }): Promise<void>;
  signup(input: { name: string; email: string; password: string }): Promise<AuthUser>;
  logout(): void;
  refreshUser(): Promise<void>;
  clearError(): void;
};

const SESSION_KEY = "ecosphere.auth.v1";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const restoreStarted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const stored = readStoredSession();
    if (!stored?.token) {
      clearSession();
      return;
    }
    const data = await apiRequest<{ user: AuthUser }>("/auth/me", { token: stored.token });
    const next = { token: stored.token, user: data.user };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("authenticated");
  }, [clearSession]);

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    void refreshUser().catch((restoreError) => {
      setError(restoreError instanceof Error ? restoreError : new Error("Unable to restore session."));
      clearSession();
    });
  }, [clearSession, refreshUser]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    setError(null);
    const data = await apiRequest<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: input });
    const next = { token: data.token, user: data.user };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("authenticated");
  }, []);

  const signup = useCallback(async (input: { name: string; email: string; password: string }) => {
    setError(null);
    const data = await apiRequest<{ user: AuthUser }>("/auth/signup", { method: "POST", body: input });
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true, state: { from: location.pathname } });
  }, [clearSession, location.pathname, navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    token: session?.token ?? null,
    user: session?.user ?? null,
    error,
    login,
    signup,
    logout,
    refreshUser,
    clearError: () => setError(null)
  }), [error, login, logout, refreshUser, session, signup, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function readStoredSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (typeof parsed.token !== "string" || !parsed.user?.id) return null;
    return parsed as AuthSession;
  } catch {
    return null;
  }
}

