import { useMemo, useState, type FormEvent } from "react";
import { Download, Plus, RefreshCw, Send } from "lucide-react";
import { apiRequest, isApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { routeTitles } from "../app/navigation";
import { useApiPage, useApiResource } from "../hooks/useApiResource";
import { formatDate, formatDecimal } from "../utils/format";
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select, SectionHeader } from "../components/ui/primitives";

type Field = { name: string; label: string; type?: "text" | "number" | "date" | "url" | "select" | "textarea"; options?: string[]; required?: boolean };
type PageConfig = {
  path: string;
  endpoint: string;
  mode: "page" | "resource";
  createRoles?: string[];
  fields?: Field[];
  deactivate?: boolean;
  csvExport?: string;
  action?: { label: string; method: "POST" | "PATCH"; endpoint: string; roles: string[] };
};

const configs: Record<string, PageConfig> = {
  "/environmental/emission-factors": {
    path: "/environmental/emission-factors",
    endpoint: "/emission-factors",
    mode: "page",
    createRoles: ["ADMIN", "ESG_MANAGER"],
    deactivate: true,
    fields: [
      { name: "code", label: "Code", required: true },
      { name: "activityName", label: "Activity name", required: true },
      { name: "factorValue", label: "Factor value", type: "number", required: true },
      { name: "inputUnit", label: "Input unit", required: true },
      { name: "outputUnit", label: "Output unit", required: true },
      { name: "applicableSourceType", label: "Source type", type: "select", options: ["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "UTILITY", "OTHER"] },
      { name: "validFrom", label: "Valid from", type: "date", required: true },
      { name: "validTo", label: "Valid to", type: "date" }
    ]
  },
  "/environmental/carbon-transactions": {
    path: "/environmental/carbon-transactions",
    endpoint: "/carbon-transactions",
    mode: "page",
    createRoles: ["ADMIN", "ESG_MANAGER", "EMPLOYEE"],
    fields: [
      { name: "departmentId", label: "Department ID", required: true },
      { name: "emissionFactorId", label: "Emission factor ID", required: true },
      { name: "quantity", label: "Quantity", type: "number", required: true },
      { name: "transactionDate", label: "Transaction date", type: "date", required: true },
      { name: "sourceType", label: "Source type", type: "select", options: ["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "UTILITY", "OTHER"] }
    ]
  },
  "/environmental/goals": { path: "/environmental/goals", endpoint: "/environmental-goals", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER"], deactivate: true, fields: goalFields() },
  "/social/csr-activities": { path: "/social/csr-activities", endpoint: "/csr-activities", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER"], deactivate: true, fields: csrFields() },
  "/social/participations": { path: "/social/participations", endpoint: "/participations", mode: "page" },
  "/gamification/challenges": { path: "/gamification/challenges", endpoint: "/challenges", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER"], deactivate: true, fields: challengeFields() },
  "/gamification/badges": { path: "/gamification/badges", endpoint: "/badges", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER"], deactivate: true, fields: badgeFields() },
  "/gamification/rewards": { path: "/gamification/rewards", endpoint: "/rewards", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER"], deactivate: true, fields: rewardFields() },
  "/gamification/leaderboard": { path: "/gamification/leaderboard", endpoint: "/leaderboard", mode: "resource" },
  "/governance/policies": { path: "/governance/policies", endpoint: "/policies", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER"], deactivate: true, fields: policyFields() },
  "/governance/audits": { path: "/governance/audits", endpoint: "/audits", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER", "AUDITOR"], fields: auditFields() },
  "/governance/compliance": { path: "/governance/compliance", endpoint: "/compliance-issues", mode: "page", createRoles: ["ADMIN", "ESG_MANAGER", "AUDITOR"], fields: complianceFields() },
  "/reports": { path: "/reports", endpoint: "/reports/esg-summary", mode: "resource", csvExport: "/reports/esg-summary/export" },
  "/notifications": { path: "/notifications", endpoint: "/notifications", mode: "page" },
  "/admin/departments": { path: "/admin/departments", endpoint: "/departments", mode: "page", createRoles: ["ADMIN"], deactivate: true, fields: departmentFields() },
  "/admin/categories": { path: "/admin/categories", endpoint: "/categories", mode: "page", createRoles: ["ADMIN"], deactivate: true, fields: categoryFields() },
  "/settings": { path: "/settings", endpoint: "/esg-configuration", mode: "resource", createRoles: ["ADMIN"], fields: settingsFields() }
};

export function IntegratedResourcePage({ path }: { path: string }) {
  const config = configs[path];
  const meta = routeTitles[path] ?? { title: "EcoSphere", eyebrow: "Module", description: "Manage ESG records." };
  const auth = useAuth();
  const pageState = useApiPage<any>(config?.endpoint ?? "/notifications", { query: { limit: 20 } });
  const resourceState = useApiResource<any>(config?.endpoint ?? "/notifications");
  const page = config?.mode === "page" ? pageState : null;
  const resource = config?.mode === "resource" ? resourceState : null;
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canCreate = Boolean(config.createRoles?.includes(auth.user?.role ?? ""));

  if (!config) return <ErrorState title="Missing integration" description="This route is not configured for API integration." />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.token) return;
    const formData = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    for (const field of config.fields ?? []) {
      const raw = formData.get(field.name);
      if (raw === null || raw === "") continue;
      body[field.name] = field.type === "number" ? String(raw) : String(raw);
    }
    try {
      await apiRequest(config.endpoint, { method: config.path === "/settings" ? "PATCH" : "POST", token: auth.token, body });
      setMessage("Saved successfully.");
      setFormOpen(false);
      page?.refetch();
      resource?.refetch();
    } catch (error) {
      setMessage(isApiError(error) ? `${error.message}${error.requestId ? ` Request ${error.requestId}` : ""}` : "Save failed.");
    }
  }

  async function deactivate(id: string) {
    if (!auth.token) return;
    await apiRequest(`${config.endpoint}/${id}`, { method: "DELETE", token: auth.token });
    page?.refetch();
  }

  async function downloadCsv() {
    if (!auth.token || !config.csvExport) return;
    const blob = await apiRequest<Blob>(config.csvExport, { token: auth.token, accept: "csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ecosphere-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const data = page?.data?.data ?? (Array.isArray(resource?.data) ? resource.data : resource?.data ? [resource.data] : []);
  const state = page ?? resource;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        actions={
          <>
            {config.csvExport ? <Button variant="secondary" onClick={downloadCsv}><Download aria-hidden="true" className="h-4 w-4" />CSV</Button> : null}
            {canCreate && config.fields ? <Button onClick={() => setFormOpen((value) => !value)}><Plus aria-hidden="true" className="h-4 w-4" />{config.path === "/settings" ? "Update" : "Create"}</Button> : null}
          </>
        }
      />
      {message ? <Card><p className="text-sm text-[var(--text-secondary)]" role="status">{message}</p></Card> : null}
      {formOpen ? (
        <Card>
          <SectionHeader title={config.path === "/settings" ? "Update settings" : `Create ${meta.title}`} />
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            {(config.fields ?? []).map((field) => <FormField key={field.name} field={field} />)}
            <div className="md:col-span-2"><Button type="submit"><Send aria-hidden="true" className="h-4 w-4" />Submit</Button></div>
          </form>
        </Card>
      ) : null}
      {state?.status === "loading" ? <LoadingState label={`Loading ${meta.title}`} /> : null}
      {state?.status === "error" ? <ErrorState description={state.error.message} /> : null}
      {state?.status === "success" && data.length === 0 ? <EmptyState title={`No ${meta.title.toLowerCase()} yet`} description="Create or seed records to populate this view." /> : null}
      {state?.status === "success" && data.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[var(--text-muted)]">
                <tr>
                  {columnsFor(data).map((column) => <th key={column} className="px-3 py-2 font-medium">{labelFor(column)}</th>)}
                  {config.deactivate && canCreate ? <th className="px-3 py-2 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {data.map((row: any) => (
                  <tr key={row.id ?? JSON.stringify(row).slice(0, 20)} className="border-t border-[var(--border)]">
                    {columnsFor(data).map((column) => <td key={column} className="px-3 py-3 text-[var(--text-secondary)]">{renderValue(row[column], column)}</td>)}
                    {config.deactivate && canCreate ? <td className="px-3 py-3"><Button variant="ghost" onClick={() => deactivate(row.id)}><RefreshCw aria-hidden="true" className="h-4 w-4" />Deactivate</Button></td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function FormField({ field }: { field: Field }) {
  const id = `field-${field.name}`;
  return (
    <label htmlFor={id} className="block text-sm text-[var(--text-secondary)]">
      {field.label}{field.required ? " *" : ""}
      {field.type === "select" ? (
        <Select id={id} name={field.name} className="mt-2 w-full" required={field.required} defaultValue="">
          <option value="">Select</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </Select>
      ) : (
        <Input id={id} name={field.name} className="mt-2 w-full" required={field.required} type={field.type === "number" ? "number" : field.type ?? "text"} step={field.type === "number" ? "0.000001" : undefined} />
      )}
    </label>
  );
}

function columnsFor(data: any[]) {
  const keys = new Set<string>();
  for (const row of data.slice(0, 5)) Object.keys(row ?? {}).forEach((key) => {
    if (!["passwordHash", "metadata", "sourceMetadata"].includes(key)) keys.add(key);
  });
  return Array.from(keys).slice(0, 8);
}

function renderValue(value: unknown, column: string) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return <Badge tone={value ? "success" : "neutral"}>{value ? "Yes" : "No"}</Badge>;
  if (column.toLowerCase().includes("date") || column.endsWith("At") || column.endsWith("On")) return formatDate(String(value));
  if (typeof value === "object") return "Linked record";
  if (/score|emission|co2|factor|footprint|percentage|quantity|weight/i.test(column)) return formatDecimal(value);
  return String(value);
}

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function departmentFields(): Field[] { return [{ name: "name", label: "Name", required: true }, { name: "code", label: "Code", required: true }, { name: "parentId", label: "Parent ID" }, { name: "headUserId", label: "Head user ID" }]; }
function categoryFields(): Field[] { return [{ name: "name", label: "Name", required: true }, { name: "type", label: "Type", type: "select", options: ["CSR_ACTIVITY", "CHALLENGE"], required: true }]; }
function goalFields(): Field[] { return [{ name: "name", label: "Name", required: true }, { name: "departmentId", label: "Department ID", required: true }, { name: "targetCo2", label: "Target CO2", type: "number", required: true }, { name: "currentCo2", label: "Current CO2", type: "number", required: true }, { name: "startDate", label: "Start date", type: "date", required: true }, { name: "deadline", label: "Deadline", type: "date", required: true }]; }
function csrFields(): Field[] { return [{ name: "title", label: "Title", required: true }, { name: "categoryId", label: "Category ID", required: true }, { name: "pointsAwarded", label: "Points", type: "number", required: true }, { name: "eventDate", label: "Event date", type: "date", required: true }]; }
function challengeFields(): Field[] { return [{ name: "title", label: "Title", required: true }, { name: "categoryId", label: "Category ID", required: true }, { name: "xp", label: "XP", type: "number", required: true }, { name: "difficulty", label: "Difficulty", type: "select", options: ["EASY", "MEDIUM", "HARD"], required: true }, { name: "startDate", label: "Start date", type: "date", required: true }, { name: "deadline", label: "Deadline", type: "date", required: true }]; }
function badgeFields(): Field[] { return [{ name: "name", label: "Name", required: true }, { name: "unlockRule", label: "Unlock rule", required: true }, { name: "icon", label: "Icon URL", type: "url" }]; }
function rewardFields(): Field[] { return [{ name: "name", label: "Name", required: true }, { name: "cost", label: "Cost", type: "number", required: true }, { name: "currency", label: "Currency", type: "select", options: ["POINTS", "XP"], required: true }, { name: "stock", label: "Stock", type: "number", required: true }, { name: "imageUrl", label: "Image URL", type: "url" }]; }
function policyFields(): Field[] { return [{ name: "title", label: "Title", required: true }, { name: "documentUrl", label: "Document URL", type: "url", required: true }]; }
function auditFields(): Field[] { return [{ name: "title", label: "Title", required: true }, { name: "departmentId", label: "Department ID", required: true }, { name: "auditorId", label: "Auditor ID", required: true }, { name: "scopeStart", label: "Scope start", type: "date", required: true }, { name: "scopeEnd", label: "Scope end", type: "date", required: true }]; }
function complianceFields(): Field[] { return [{ name: "departmentId", label: "Department ID", required: true }, { name: "ownerId", label: "Owner ID", required: true }, { name: "description", label: "Description", required: true }, { name: "severity", label: "Severity", type: "select", options: ["LOW", "MEDIUM", "HIGH"], required: true }, { name: "dueDate", label: "Due date", type: "date", required: true }]; }
function settingsFields(): Field[] { return [{ name: "environmentalWeight", label: "Environmental weight", type: "number" }, { name: "socialWeight", label: "Social weight", type: "number" }, { name: "governanceWeight", label: "Governance weight", type: "number" }]; }
