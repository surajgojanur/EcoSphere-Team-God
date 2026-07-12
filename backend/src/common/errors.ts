import { Prisma } from "@prisma/client";

export const errorCodes = [
  "VALIDATION_ERROR",
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INACTIVE_USER",
  "NOT_FOUND",
  "CONFLICT",
  "EMAIL_ALREADY_EXISTS",
  "DUPLICATE_PARTICIPATION",
  "DUPLICATE_ACKNOWLEDGEMENT",
  "DUPLICATE_OPERATIONAL_EVENT",
  "INVALID_STATE",
  "PROOF_REQUIRED",
  "SELF_APPROVAL_FORBIDDEN",
  "INSUFFICIENT_POINTS",
  "INSUFFICIENT_XP",
  "OUT_OF_STOCK",
  "INVALID_ESG_WEIGHTS",
  "INVALID_PARENT_DEPARTMENT",
  "INVALID_BADGE_RULE",
  "INTERNAL_ERROR"
] as const;

export type ErrorCode = (typeof errorCodes)[number];

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, code: ErrorCode, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function mapPrismaError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return new AppError(409, "CONFLICT", "A record with the same unique value already exists.");
    if (error.code === "P2025") return new AppError(404, "NOT_FOUND", "The requested resource was not found.");
    if (error.code === "P2003") return new AppError(409, "CONFLICT", "The request conflicts with related records.");
  }
  return new AppError(500, "INTERNAL_ERROR", "An unexpected server error occurred.");
}

