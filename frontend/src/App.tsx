import { useEffect, useMemo, useState } from "react";

type BackendState =
  | { status: "loading"; message: string }
  | { status: "connected"; message: string; timestamp: string }
  | { status: "error"; message: string };

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [backendState, setBackendState] = useState<BackendState>({
    status: "loading",
    message: "Checking backend health..."
  });

  const healthUrl = useMemo(() => `${apiUrl.replace(/\/$/, "")}/health`, []);

  useEffect(() => {
    const controller = new AbortController();

    async function checkBackend() {
      try {
        const response = await fetch(healthUrl, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Backend returned HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          status?: string;
          timestamp?: string;
        };

        setBackendState({
          status: "connected",
          message: `Backend health check returned ${data.status ?? "ok"}.`,
          timestamp: data.timestamp ?? new Date().toISOString()
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setBackendState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to reach backend health endpoint."
        });
      }
    }

    void checkBackend();

    return () => controller.abort();
  }, [healthUrl]);

  return (
    <main className="min-h-screen bg-[#111318] px-4 py-8 text-[#E8E9ED] sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="border-b border-[#2E313A] pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-[#3FCF6E]">
            Development Baseline
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            EcoSphere ESG Management Platform
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9A9DA8]">
            Foundation-only environment for the hackathon: React frontend,
            Express backend, PostgreSQL, Prisma, Docker Compose, and health
            checks. ESG business modules start in the next task.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusPanel label="Frontend" value="running" tone="green" />
          <StatusPanel label="Backend URL" value={apiUrl} tone="blue" />
          <StatusPanel label="Database" value="checked by /ready" tone="purple" />
        </div>

        <section className="rounded-lg border border-[#2E313A] bg-[#1B1E25] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-medium">Backend Connection</h2>
              <p className="mt-1 text-sm text-[#9A9DA8]">{healthUrl}</p>
            </div>
            <ConnectionBadge status={backendState.status} />
          </div>
          <p className="mt-5 text-sm leading-6 text-[#E8E9ED]">
            {backendState.message}
          </p>
          {backendState.status === "connected" ? (
            <p className="mt-2 text-xs text-[#9A9DA8]">
              Last checked at {backendState.timestamp}
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function StatusPanel({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "green" | "blue" | "purple";
}) {
  const colors = {
    green: "border-l-[#3FCF6E]",
    blue: "border-l-[#4F9BFF]",
    purple: "border-l-[#9B7BFF]"
  };

  return (
    <article
      className={`rounded-lg border border-[#2E313A] border-l-4 bg-[#1B1E25] p-5 ${colors[tone]}`}
    >
      <p className="text-sm text-[#9A9DA8]">{label}</p>
      <p className="mt-2 break-words text-base font-medium text-white">{value}</p>
    </article>
  );
}

function ConnectionBadge({ status }: { status: BackendState["status"] }) {
  const styles = {
    loading: "bg-[#F5C542]/15 text-[#F5C542]",
    connected: "bg-[#3FCF6E]/15 text-[#3FCF6E]",
    error: "bg-[#FF5C5C]/15 text-[#FF5C5C]"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default App;
