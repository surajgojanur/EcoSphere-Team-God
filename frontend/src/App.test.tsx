import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";

function mockHealthFetch() {
  sessionStorage.setItem("ecosphere.auth.v1", JSON.stringify({
    token: "test-token",
    user: { id: "u1", name: "Admin User", email: "admin@example.com", role: "ADMIN", departmentId: null, departmentName: null }
  }));
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const createResponse = (data: any) => Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(data),
        blob: () => Promise.resolve(new Blob())
      } as Response);

      if (url.includes("/auth/me")) {
        return createResponse({ success: true, data: { user: { id: "u1", name: "Admin User", email: "admin@example.com", role: "ADMIN", departmentId: null, departmentName: null } }, meta: { requestId: "00000000-0000-4000-8000-000000000001" } });
      }
      if (url.includes("/dashboard/scores")) {
        return createResponse({ success: true, data: { overallScore: "78.42", hasData: true, departments: [{ id: "s1", departmentId: "d1", environmentalScore: "70", socialScore: "80", governanceScore: "90", totalScore: "80", hasEnvironmentalData: true, hasSocialData: true, hasGovernanceData: true }] }, meta: { requestId: "00000000-0000-4000-8000-000000000002" } });
      }
      if (url.includes("/dashboard/emissions-trend")) {
        return createResponse({ success: true, data: [{ month: "2026-07", emissions: "268.00" }], meta: { requestId: "00000000-0000-4000-8000-000000000003" } });
      }
      if (url.includes("/dashboard/department-ranking")) {
        return createResponse({ success: true, data: [{ departmentId: "d1", departmentName: "Manufacturing", totalScore: "80", rank: 1 }], meta: { requestId: "00000000-0000-4000-8000-000000000004" } });
      }
      if (url.includes("/dashboard/recent-activity")) {
        return createResponse({ success: true, data: [{ id: "a1", action: "SEED_COMPLETED", entityType: "System", createdAt: "2026-07-12T00:00:00.000Z" }], meta: { requestId: "00000000-0000-4000-8000-000000000005" } });
      }
      if (url.includes("/notifications/unread-count")) {
        return createResponse({ success: true, data: { unreadCount: 0 }, meta: { requestId: "00000000-0000-4000-8000-000000000006" } });
      }
      if (url.includes("/notifications")) {
        return createResponse({ success: true, data: [], meta: { requestId: "00000000-0000-4000-8000-000000000007" } });
      }
      return createResponse({ status: "ok", timestamp: "2026-07-12T00:00:00.000Z" });
    })
  );
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
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
    const logoutButton = screen.getByRole("button", { name: /Log out/i });
    expect(logoutButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(logoutButton).toHaveFocus();

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
