import { Prisma } from "@prisma/client";

export function serialize(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) return value.toFixed();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => serialize(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "passwordHash" && key !== "password_hash")
        .map(([key, item]) => [key, serialize(item)])
    );
  }
  return value;
}

