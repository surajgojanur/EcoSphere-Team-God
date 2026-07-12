import { ClipboardList } from "lucide-react";
import { getRouteMeta } from "../app/navigation";
import { Badge, Card, PageHeader, SectionHeader, Skeleton } from "../components/ui/primitives";

export function PlaceholderPage({ path }: { path: string }) {
  const meta = getRouteMeta(path);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
      <Card className="page-reveal">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgba(79,155,255,0.14)] text-[var(--accent-blue)]">
              <ClipboardList aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-medium text-white">Workspace foundation</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                This area is prepared for focused ESG work with consistent navigation, page context, responsive layout, keyboard focus, and calm transitions.
              </p>
            </div>
          </div>
          <Badge tone="info">Workspace</Badge>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="page-reveal">
          <SectionHeader title="Record list" />
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </Card>
        <Card className="page-reveal lg:col-span-2">
          <SectionHeader title="Workspace" description="This page will use the shared enterprise patterns for search, filters, records, state feedback, and primary actions." />
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface-alt)] p-6 text-center">
            <h2 className="text-base font-medium text-[var(--text-primary)]">No records to show yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              When this workspace is active, records and next actions will appear here with clear status and ownership.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
