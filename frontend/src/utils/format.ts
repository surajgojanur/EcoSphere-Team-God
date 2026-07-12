export function formatDecimal(value: unknown, options: Intl.NumberFormatOptions = {}) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, ...options }).format(numeric);
}

export function formatPercent(value: unknown) {
  return `${formatDecimal(value, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
}

export function formatEmission(value: unknown) {
  return `${formatDecimal(value, { maximumFractionDigits: 2 })} kgCO2e`;
}

export function formatPoints(value: unknown) {
  return formatDecimal(value, { maximumFractionDigits: 0 });
}

export function formatDate(value: unknown) {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function roleLabel(role: string) {
  if (role === "ESG_MANAGER") return "Sustainability Manager";
  return role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function initials(name?: string | null) {
  return (name ?? "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

