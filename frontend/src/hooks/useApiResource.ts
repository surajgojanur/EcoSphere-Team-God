import { useCallback, useEffect, useState } from "react";
import { apiPage, apiRequest, type ApiPaginatedSuccess, type ApiRequestOptions } from "../api/client";
import { useAuth } from "../auth/useAuth";

export type ResourceState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: Error };

export type UseApiOptions = ApiRequestOptions & { enabled?: boolean };

export function useApiResource<T>(path: string, options: UseApiOptions = {}) {
  const { token } = useAuth();
  const [state, setState] = useState<ResourceState<T>>({
    status: options.enabled === false ? "success" : "loading", // Starting as success with null is wrong if we expect T, but let's keep loading or handle it
    data: null as unknown as T,
    error: null
  });

  const load = useCallback((signal?: AbortSignal) => {
    if (options.enabled === false) return Promise.resolve();
    setState((current) => current.status === "success" ? current : { status: "loading", data: null as unknown as T, error: null });
    return apiRequest<T>(path, { ...options, token, signal })
      .then((data) => {
        if (!signal?.aborted) setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (error?.code === "REQUEST_ABORTED" || signal?.aborted) return;
        setState({ status: "error", data: null as unknown as T, error: error instanceof Error ? error : new Error("Request failed") });
      });
  }, [path, token, JSON.stringify(options.query ?? {}), options.method, options.enabled]);

  useEffect(() => {
    if (options.enabled === false) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, options.enabled]);

  return { ...state, refetch: () => load() };
}

export function useApiPage<T>(path: string, options: UseApiOptions = {}) {
  const { token } = useAuth();
  const [state, setState] = useState<ResourceState<ApiPaginatedSuccess<T>>>({
    status: options.enabled === false ? "loading" : "loading",
    data: null as unknown as ApiPaginatedSuccess<T>,
    error: null
  });

  const load = useCallback((signal?: AbortSignal) => {
    if (options.enabled === false) return Promise.resolve();
    setState((current) => current.status === "success" ? current : { status: "loading", data: null as unknown as ApiPaginatedSuccess<T>, error: null });
    return apiPage<T>(path, { ...options, token, signal })
      .then((data) => {
        if (!signal?.aborted) setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (error?.code === "REQUEST_ABORTED" || signal?.aborted) return;
        setState({ status: "error", data: null as unknown as ApiPaginatedSuccess<T>, error: error instanceof Error ? error : new Error("Request failed") });
      });
  }, [path, token, JSON.stringify(options.query ?? {}), options.method, options.enabled]);

  useEffect(() => {
    if (options.enabled === false) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, options.enabled]);

  return { ...state, refetch: () => load() };
}

