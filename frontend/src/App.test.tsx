import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the EcoSphere development baseline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ok",
              timestamp: "2026-07-12T00:00:00.000Z"
            })
        })
      )
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /EcoSphere ESG Management Platform/i
      })
    ).toBeInTheDocument();
  });
});
