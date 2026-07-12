import { Link } from "react-router-dom";
import { Card, PageHeader } from "../components/ui/primitives";

export function NotFoundPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="404"
        title="Route not found"
        description="The route you opened is not part of the current EcoSphere frontend map."
        actions={
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--accent-green)] px-4 py-2 text-sm font-medium text-[#07120b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        }
      />
      <Card className="page-reveal">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Unknown routes are intentionally handled by a polished 404 state so navigation failures do not fall through to a blank screen.
        </p>
      </Card>
    </div>
  );
}
