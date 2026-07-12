import { useMemo, useState } from "react";
import { getRouteMeta } from "../app/navigation";
import { policies, policyById, type Policy } from "../app/policies";
import { Badge, Card, PageHeader, SectionHeader } from "../components/ui/primitives";

function groupPoliciesByCategory(policyList: Policy[]) {
  const groups: Record<string, Policy[]> = {};
  policyList.forEach((policy) => {
    if (!groups[policy.category]) {
      groups[policy.category] = [];
    }
    groups[policy.category].push(policy);
  });
  return Object.entries(groups).map(([category, items]) => ({ category, items }));
}

export function PoliciesPage({ path }: { path: string }) {
  const meta = getRouteMeta(path);
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id ?? "");
  const policyGroups = useMemo(() => groupPoliciesByCategory(policies), []);
  const selectedPolicy = useMemo(
    () => policyById.get(selectedPolicyId) ?? policies[0],
    [selectedPolicyId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr]">
        <Card className="page-reveal" density="compact">
          <SectionHeader title="Policy library" description="Browse EcoSphere policies by category and select a policy to view the full statement." />
          <div className="space-y-4">
            {policyGroups.map((group) => (
              <div key={group.category}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-green)]">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.items.map((policy) => (
                    <button
                      key={policy.id}
                      type="button"
                      onClick={() => setSelectedPolicyId(policy.id)}
                      className={`w-full rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                        policy.id === selectedPolicyId
                          ? "border-[var(--accent-green)] bg-[var(--surface-raised)] text-[var(--text-primary)]"
                          : "border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:border-[var(--focus-ring)] hover:bg-[var(--surface-nested)]"
                      }`}
                    >
                      <div className="font-semibold text-[var(--text-primary)]">{policy.title}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">{policy.id}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="page-reveal">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-green)]">{selectedPolicy.category}</p>
                <h2 className="heading-copy mt-2 text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-bold leading-[1.05] text-white">{selectedPolicy.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Policy ID {selectedPolicy.id} • Version {selectedPolicy.version}</p>
              </div>
              <div className="grid gap-2 sm:auto-cols-max sm:grid-flow-col">
                <Badge tone="info">Effective {selectedPolicy.effectiveDate}</Badge>
                <Badge tone="neutral">Review {selectedPolicy.reviewFrequency}</Badge>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Purpose</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.purpose}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Scope</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.scope}</p>
                </div>
              </div>
              <div className="space-y-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Approval Authority</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.approvalAuthority}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Exceptions</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.exceptions}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Policy Statement</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selectedPolicy.policyStatement}</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-4">
                  <h4 className="text-sm font-semibold text-white">Employee Responsibilities</h4>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.employeeResponsibilities}</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-4">
                  <h4 className="text-sm font-semibold text-white">Manager Responsibilities</h4>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.managerResponsibilities}</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-4">
                  <h4 className="text-sm font-semibold text-white">Compliance Requirements</h4>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedPolicy.complianceRequirements}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
