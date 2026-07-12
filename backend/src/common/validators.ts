import { z } from "zod";

export const idParam = z.object({ id: z.string().uuid() });
export const departmentIdParam = z.object({ departmentId: z.string().uuid() });

export const pageQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  departmentId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
}).passthrough();

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const decimalString = z.union([z.string(), z.number()]).transform((value) => String(value));

export function safeUrl(optional = false) {
  const schema = z.string().trim().max(2048).url().refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "URL must use http or https");
  return optional ? schema.optional().nullable() : schema;
}

export function businessDate(value: string | Date) {
  return value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
}

