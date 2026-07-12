import { useEffect, useState } from "react";
import { type BackendHealthState, fetchBackendHealth } from "../api/health";

export function useBackendHealth() {
  const [state, setState] = useState<BackendHealthState>({
    status: "loading",
    message: "Checking system status..."
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      try {
        setState(await fetchBackendHealth(controller.signal));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to reach the system status service."
        });
      }
    }

    void loadHealth();

    return () => controller.abort();
  }, []);

  return state;
}
