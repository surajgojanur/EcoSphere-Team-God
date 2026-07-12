export type UserRole = "ADMIN" | "ESG_MANAGER" | "EMPLOYEE" | "AUDITOR";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  departmentName: string | null;
  isActive?: boolean;
};

export type ApiFieldErrors = Record<string, string[]>;

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INACTIVE_USER"
  | "NOT_FOUND"
  | "CONFLICT"
  | "EMAIL_ALREADY_EXISTS"
  | "DUPLICATE_PARTICIPATION"
  | "DUPLICATE_ACKNOWLEDGEMENT"
  | "DUPLICATE_OPERATIONAL_EVENT"
  | "INVALID_STATE"
  | "PROOF_REQUIRED"
  | "SELF_APPROVAL_FORBIDDEN"
  | "INSUFFICIENT_POINTS"
  | "INSUFFICIENT_XP"
  | "OUT_OF_STOCK"
  | "INVALID_ESG_WEIGHTS"
  | "INVALID_PARENT_DEPARTMENT"
  | "INVALID_BADGE_RULE"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "REQUEST_ABORTED"
  | "UNKNOWN_ERROR";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  fields?: ApiFieldErrors;
  requestId?: string;

  constructor(message: string, options: { status: number; code: ApiErrorCode; fields?: ApiFieldErrors; requestId?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields;
    this.requestId = options.requestId;
  }
}

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: { requestId: string };
};

export type ApiPaginatedSuccess<T> = {
  success: true;
  data: T[];
  meta: { requestId: string; page: number; limit: number; total: number; totalPages: number };
};

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  token?: string | null;
  query?: Record<string, string | number | boolean | null | undefined>;
  accept?: "json" | "csv";
  timeoutMs?: number;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const headers = new Headers();
    headers.set("Accept", options.accept === "csv" ? "text/csv" : "application/json");
    if (options.body !== undefined) headers.set("Content-Type", "application/json");
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal
    });

    if (options.accept === "csv") {
      if (!response.ok) await throwApiError(response);
      return (await response.blob()) as T;
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      if (response.status === 401 && !signal.aborted) unauthorizedHandler?.();
      throw normalizePayloadError(response, payload);
    }
    if (response.status === 204) return null as unknown as T;
    return payload?.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request was aborted.", { status: 0, code: "REQUEST_ABORTED" });
    }
    throw new ApiError("Unable to reach the EcoSphere API.", { status: 0, code: "NETWORK_ERROR" });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function apiPage<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiPaginatedSuccess<T>> {
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  try {
    const headers = new Headers({ Accept: "application/json" });
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
    const response = await fetch(url, { method: options.method ?? "GET", headers, signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      if (response.status === 401 && !signal.aborted) unauthorizedHandler?.();
      throw normalizePayloadError(response, payload);
    }
    return payload as ApiPaginatedSuccess<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new ApiError("Request was aborted.", { status: 0, code: "REQUEST_ABORTED" });
    throw new ApiError("Unable to reach the EcoSphere API.", { status: 0, code: "NETWORK_ERROR" });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function throwApiError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => null);
  throw normalizePayloadError(response, payload);
}

function normalizePayloadError(response: Response, payload: any): ApiError {
  const code = (payload?.error?.code ?? (response.status === 401 ? "UNAUTHORIZED" : "UNKNOWN_ERROR")) as ApiErrorCode;
  return new ApiError(payload?.error?.message ?? `Request failed with status ${response.status}.`, {
    status: response.status,
    code,
    fields: payload?.error?.fields,
    requestId: payload?.meta?.requestId
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

