import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function mockHealthFetch() {
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
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>
  );
}

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("App", () => {
  beforeEach(() => {
    mockHealthFetch();
  });

  it("renders the EcoSphere dashboard shell", async () => {
    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: /ESG Command Center/i
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /Primary/i })).toBeInTheDocument();
  });

  it("renders the gamification workspace instead of the placeholder", async () => {
    renderRoute("/gamification/challenges");

    expect(await screen.findByRole("heading", { name: /Challenges/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Challenges/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: /Gamification engine/i })).toBeInTheDocument();
    expect(screen.queryByText(/Workspace foundation/i)).not.toBeInTheDocument();
  });

  it("routes demo login selections to the dashboard", async () => {
    const user = userEvent.setup();
    renderRoute("/login");

    await user.click(await screen.findByRole("button", { name: /Admin/i }));

    expect(await screen.findByRole("heading", { name: /ESG Command Center/i })).toBeInTheDocument();
  });

  it("traps modal focus, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await screen.findByRole("heading", { name: /ESG Command Center/i });
    const trigger = screen.getByRole("button", { name: /Open profile menu/i });

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: /Profile/i
    });
    const closeButton = within(dialog).getByRole("button", {
      name: /Close dialog/i
    });

    await waitFor(() => expect(closeButton).toHaveFocus());
    expect(document.body.style.overflow).toBe("hidden");

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", {
          name: /Profile/i
        })
      ).not.toBeInTheDocument()
    );
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("traps mobile drawer focus, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await screen.findByRole("heading", { name: /ESG Command Center/i });
    const trigger = screen.getByRole("button", { name: /Open navigation/i });

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: /EcoSphere navigation/i
    });
    const closeButton = within(dialog).getByRole("button", {
      name: /Close navigation/i
    });

    await waitFor(() => expect(closeButton).toHaveFocus());
    expect(document.body.style.overflow).toBe("hidden");

    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", {
          name: /EcoSphere navigation/i
        })
      ).not.toBeInTheDocument()
    );
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
});
