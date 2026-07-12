import { Link } from "react-router-dom";
import { Card, PageHeader } from "../components/ui/primitives";

export function NotFoundPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="404"
        title="Route not found"
        description="The route you opened is not part of the EcoSphere workspace map."
        actions={
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-green)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        }
      />
      <Card className="page-reveal">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Return to the dashboard to review ESG health, open an operational module, or continue toward reporting.
        </p>
      </Card>
    </div>
  );
}
