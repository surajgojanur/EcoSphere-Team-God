import type { Response } from "express";
import type { AppRequest } from "./types.js";
import { serialize } from "./serialize.js";

export function sendSuccess(req: AppRequest, res: Response, data: unknown, status = 200) {
  return res.status(status).json({
    success: true,
    data: serialize(data),
    meta: { requestId: req.requestId }
  });
}

export function sendPage(
  req: AppRequest,
  res: Response,
  data: unknown[],
  page: number,
  limit: number,
  total: number
) {
  return res.status(200).json({
    success: true,
    data: serialize(data),
    meta: {
      requestId: req.requestId,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  });
}

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

