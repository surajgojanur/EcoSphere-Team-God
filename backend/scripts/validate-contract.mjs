import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const contractPath = resolve(repoRoot, "contracts/openapi.yaml");
const examples = [
  "contracts/examples/auth.json",
  "contracts/examples/errors.json",
  "contracts/examples/pagination.json"
];
const approvedRoles = new Set(["ADMIN", "ESG_MANAGER", "EMPLOYEE", "AUDITOR"]);
const forbiddenRoleText = ["HR_MANAGER", "SUSTAINABILITY_MANAGER"];
const requiredPaths = [
  "/health",
  "/ready",
  "/auth/signup",
  "/auth/login",
  "/auth/me",
  "/departments",
  "/categories",
  "/esg-configuration",
  "/notification-settings",
  "/emission-factors",
  "/product-esg-profiles",
  "/integrations/operational-emissions/preview",
  "/integrations/operational-emissions",
  "/carbon-transactions",
  "/environmental-goals",
  "/csr-activities",
  "/participations",
  "/participations/mine",
  "/social/diversity",
  "/diversity-snapshots",
  "/training-records",
  "/training-records/mine",
  "/social/training-summary",
  "/policies",
  "/audits",
  "/compliance-issues",
  "/challenges",
  "/challenge-participations",
  "/badges",
  "/badges/mine",
  "/rewards",
  "/reward-redemptions",
  "/leaderboard",
  "/notifications",
  "/notifications/unread-count",
  "/activity-logs",
  "/scores/departments",
  "/scores/overall",
  "/dashboard/scores",
  "/dashboard/emissions-trend",
  "/dashboard/department-ranking",
  "/dashboard/recent-activity",
  "/reports/environmental",
  "/reports/social",
  "/reports/governance",
  "/reports/esg-summary",
  "/reports/custom",
  "/reports/environmental/export",
  "/reports/social/export",
  "/reports/governance/export",
  "/reports/esg-summary/export",
  "/reports/custom/export",
  "/admin/jobs/recompute-overdue",
  "/admin/jobs/recompute-scores",
  "/admin/jobs/send-policy-reminders"
];

function fail(message) {
  throw new Error(message);
}

function parseJsonFile(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function resolveRef(root, ref) {
  if (!ref.startsWith("#/")) {
    fail(`Only local refs are allowed: ${ref}`);
  }

  return ref
    .slice(2)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((current, part) => {
      if (current?.[part] === undefined) {
        fail(`Unresolved $ref: ${ref}`);
      }
      return current[part];
    }, root);
}

function visit(value, callback) {
  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, callback));
    return;
  }
  if (value && typeof value === "object") {
    callback(value);
    Object.values(value).forEach((item) => visit(item, callback));
  }
}

const specText = readFileSync(contractPath, "utf8");
const spec = JSON.parse(specText);

if (spec.openapi !== "3.1.0") {
  fail("contracts/openapi.yaml must use OpenAPI 3.1.0");
}
if (!spec.components?.securitySchemes?.bearerAuth) {
  fail("bearerAuth security scheme is required");
}

for (const examplePath of examples) {
  parseJsonFile(examplePath);
}

for (const forbidden of forbiddenRoleText) {
  if (specText.includes(forbidden)) {
    fail(`Forbidden role value found in API contract: ${forbidden}`);
  }
}

visit(spec, (node) => {
  if (node.$ref) {
    resolveRef(spec, node.$ref);
  }
});

const operationIds = new Set();
const pathEntries = Object.entries(spec.paths ?? {});
for (const requiredPath of requiredPaths) {
  if (!spec.paths?.[requiredPath]) {
    fail(`Required path is missing: ${requiredPath}`);
  }
}
for (const forbiddenPath of ["/auth/register", "/auth/refresh", "/auth/logout"]) {
  if (spec.paths?.[forbiddenPath]) {
    fail(`Forbidden auth endpoint documented: ${forbiddenPath}`);
  }
}

for (const [path, methods] of pathEntries) {
  for (const [method, operationOrRef] of Object.entries(methods)) {
    const operation = operationOrRef.$ref ? resolveRef(spec, operationOrRef.$ref) : operationOrRef;
    if (!operation.operationId) {
      fail(`${method.toUpperCase()} ${path} is missing operationId`);
    }
    if (operationIds.has(operation.operationId)) {
      fail(`Duplicate operationId: ${operation.operationId}`);
    }
    operationIds.add(operation.operationId);

    const isPublic = ["/health", "/ready", "/auth/signup", "/auth/login"].includes(path);
    if (isPublic) {
      if (!Array.isArray(operation.security) || operation.security.length !== 0) {
        fail(`Public operation must declare security: [] at ${method.toUpperCase()} ${path}`);
      }
      continue;
    }

    const hasBearer = Array.isArray(operation.security) && operation.security.some((entry) => entry.bearerAuth);
    if (!hasBearer) {
      fail(`Protected operation missing bearerAuth at ${method.toUpperCase()} ${path}`);
    }
    if (!Array.isArray(operation["x-roles"]) || operation["x-roles"].length === 0) {
      fail(`Protected operation missing x-roles at ${method.toUpperCase()} ${path}`);
    }
    for (const role of operation["x-roles"]) {
      if (!approvedRoles.has(role)) {
        fail(`Unapproved role ${role} at ${method.toUpperCase()} ${path}`);
      }
    }
  }
}

const decimalSchema = spec.components?.schemas?.DecimalString;
if (decimalSchema?.type !== "string" || !decimalSchema.pattern) {
  fail("DecimalString must be a string schema with a numeric pattern");
}
const paginationMeta = spec.components?.schemas?.PaginationMeta;
for (const key of ["requestId", "page", "limit", "total", "totalPages"]) {
  if (!paginationMeta?.required?.includes(key)) {
    fail(`PaginationMeta missing required field: ${key}`);
  }
}
const errorEnvelope = spec.components?.schemas?.ErrorEnvelope;
if (!errorEnvelope?.properties?.error?.$ref || !errorEnvelope?.properties?.meta?.$ref) {
  fail("ErrorEnvelope must contain error and meta");
}
const errorBody = spec.components?.schemas?.ErrorBody;
if (!errorBody?.properties?.fields) {
  fail("ErrorBody must define optional fields");
}

console.log(`Validated ${operationIds.size} OpenAPI operations and ${examples.length} example files.`);
