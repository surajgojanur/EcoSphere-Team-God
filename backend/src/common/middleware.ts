import { randomUUID } from "node:crypto";
import type { NextFunction, RequestHandler, Response } from "express";
import { jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import type { ZodSchema } from "zod";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "./errors.js";
import type { AppRequest } from "./types.js";

const uuidSchema = z.string().uuid();

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  const requestId = incoming && uuidSchema.safeParse(incoming).success ? incoming : randomUUID();
  (req as AppRequest).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

export function validate(schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }): RequestHandler {
  return (req, _res, next) => {
    try {
      const appReq = req as AppRequest;
      appReq.validated = {
        body: schemas.body?.parse(req.body),
        query: schemas.query?.parse(req.query),
        params: schemas.params?.parse(req.params)
      };
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fields: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const key = issue.path.join(".") || "request";
          fields[key] = [...(fields[key] ?? []), issue.message];
        }
        next(new AppError(400, "VALIDATION_ERROR", "The submitted data is invalid.", fields));
        return;
      }
      next(error);
    }
  };
}

export function asyncRoute(handler: (req: AppRequest, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    void handler(req as AppRequest, res, next).catch(next);
  };
}

export const requireAuth: RequestHandler = asyncRoute(async (req, _res, next) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { department: true } });
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
    if (!user.isActive) throw new AppError(401, "INACTIVE_USER", "This account is inactive.");
    req.auth = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId
    };
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }
});

export function requireRoles(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    const auth = (req as AppRequest).auth;
    if (!auth) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication is required."));
      return;
    }
    if (!roles.includes(auth.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action."));
      return;
    }
    next();
  };
}

