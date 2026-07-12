import { Construction } from "lucide-react";
import { getRouteMeta } from "../app/navigation";
import { Badge, Card, EmptyState, PageHeader, SectionHeader, Skeleton } from "../components/ui/primitives";

export function PlaceholderPage({ path }: { path: string }) {
  const meta = getRouteMeta(path);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
      <Card className="page-reveal">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgba(79,155,255,0.14)] text-[var(--accent-blue)]">
              <Construction aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-medium text-white">Route shell ready</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                This page is intentionally a placeholder for a later implementation phase. Navigation, layout, route transitions, focus states and reduced-motion behavior are in place.
              </p>
            </div>
          </div>
          <Badge tone="info">Phase planned</Badge>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="page-reveal">
          <SectionHeader title="Future list area" />
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </Card>
        <Card className="page-reveal lg:col-span-2">
          <SectionHeader title="Future workspace" description="Forms, tables, filters and charts will be added only in their assigned phases." />
          <EmptyState title="No Phase 1 records" description="Mock records are limited to the dashboard preview to keep this task focused." />
        </Card>
      </div>
    </div>
  );
}
