export type BackendHealthState =
  | { status: "loading"; message: string }
  | { status: "connected"; message: string; timestamp: string }
  | { status: "error"; message: string };

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const healthUrl = `${apiUrl.replace(/\/$/, "")}/health`;

export async function fetchBackendHealth(signal?: AbortSignal): Promise<BackendHealthState> {
  const response = await fetch(healthUrl, { signal });

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    status?: string;
    timestamp?: string;
  };

  return {
    status: "connected",
    message: `Health check returned ${data.status ?? "ok"}.`,
    timestamp: data.timestamp ?? new Date().toISOString()
  };
}
