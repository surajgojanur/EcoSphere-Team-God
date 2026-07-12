import { ClipboardList } from "lucide-react";
import { getRouteMeta } from "../app/navigation";
import { Badge, Card, HighlightedHeadingText, PageHeader, SectionHeader, Skeleton } from "../components/ui/primitives";

export function PlaceholderPage({ path }: { path: string }) {
  const meta = getRouteMeta(path);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
      <Card className="page-reveal">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]">
              <ClipboardList aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h2 className="heading-copy text-xl font-bold text-white">
                <HighlightedHeadingText title="Workspace foundation" highlightClassName="heading-highlight-sm" />
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                This area is prepared for focused ESG work with consistent navigation, page context, responsive layout, keyboard focus, and calm transitions.
              </p>
            </div>
          </div>
          <Badge tone="info">Workspace</Badge>
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="page-reveal">
          <SectionHeader title="Record list" />
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </Card>
        <Card className="page-reveal xl:col-span-2">
          <SectionHeader title="Workspace" description="This page will use the shared enterprise patterns for search, filters, records, state feedback, and primary actions." />
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-nested)] p-6 text-center">
            <h2 className="heading-copy text-xl font-bold text-[var(--text-primary)]">
              <HighlightedHeadingText title="No records to show yet" highlightClassName="heading-highlight-sm" />
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              When this workspace is active, records and next actions will appear here with clear status and ownership.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
