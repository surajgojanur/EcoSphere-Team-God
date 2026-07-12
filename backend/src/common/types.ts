import type { Role } from "@prisma/client";
import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  departmentId: string | null;
};

export type AppRequest = Request & {
  requestId: string;
  auth?: AuthUser;
  validated?: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
  };
};

