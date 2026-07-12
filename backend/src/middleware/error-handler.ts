import type { ErrorRequestHandler } from "express";
import { AppError, mapPrismaError } from "../common/errors.js";
import type { AppRequest } from "../common/types.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const normalized = error instanceof AppError ? error : mapPrismaError(error);
  const requestId = (req as AppRequest).requestId ?? "unknown";

  if (process.env.NODE_ENV !== "test") {
    console.error(`[${requestId}] ${normalized.code}: ${normalized.message}`);
  }

  res.status(normalized.status).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.fields ? { fields: normalized.fields } : {})
    },
    meta: { requestId }
  });
};
