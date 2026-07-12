import { useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, ChevronLeft, ChevronRight, Menu, Search, UserCircle } from "lucide-react";
import { BrandIcon, getBreadcrumbs, getRouteMeta, navGroups, topModules } from "../../app/navigation";
import { gsap, useGSAP } from "../../lib/gsap";
import { mediaQueries, motion } from "../../styles/motion";
import { useBackendHealth } from "../../hooks/useBackendHealth";
import { Button, IconButton, Input } from "../ui/primitives";
import { Drawer, Modal } from "../ui/overlays";
import { PageTransition } from "../motion/Motion";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const backendHealth = useBackendHealth();
  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname), [location.pathname]);
  const routeMeta = getRouteMeta(location.pathname);

  useGSAP(
    () => {
      const surface = shellRef.current;
      if (!surface) {
        return;
      }

      const q = gsap.utils.selector(surface);
      const brand = q(".brand-mark");
      const navItems = q(".nav-item");
      const header = q(".top-header");
      const revealItems = q(".page-reveal");
      const dashboardCards = q(".dashboard-card");
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set([surface, ...brand, ...navItems, ...header, ...revealItems, ...dashboardCards], {
          autoAlpha: 1,
          clearProps: "transform"
        });
      });

      mm.add(mediaQueries.motionSafe, () => {
        const timeline = gsap.timeline({ defaults: { ease: motion.ease.enter } });
        timeline.fromTo(surface, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.duration.fast });
        if (brand.length) {
          timeline.fromTo(brand, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: motion.duration.normal });
        }
        if (navItems.length) {
          timeline.fromTo(
            navItems,
            { autoAlpha: 0, x: -10 },
            {
              autoAlpha: 1,
              x: 0,
              duration: motion.duration.normal,
              stagger: motion.stagger.tight
            },
            "-=0.18"
          );
        }
        if (header.length) {
          timeline.fromTo(header, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: motion.duration.normal }, "-=0.24");
        }
        if (revealItems.length) {
          timeline.fromTo(revealItems, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: motion.duration.normal, stagger: motion.stagger.tight }, "-=0.12");
        }
        if (dashboardCards.length) {
          timeline.fromTo(
            dashboardCards,
            { autoAlpha: 0, y: 18, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: motion.duration.normal,
              stagger: motion.stagger.normal
            },
            "-=0.2"
          );
        }
      });

      return () => mm.revert();
    },
    { scope: shellRef }
  );

  useGSAP(
    () => {
      const active = navRef.current?.querySelector<HTMLElement>("[aria-current='page'] .active-indicator");
      if (!active) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set(active, { autoAlpha: 1, scaleX: 1 });
      });
      mm.add(mediaQueries.motionSafe, () => {
        gsap.fromTo(
          active,
          { autoAlpha: 0.4, scaleX: 0.84 },
          { autoAlpha: 1, scaleX: 1, duration: motion.duration.fast, ease: motion.ease.enter }
        );
      });

      return () => mm.revert();
    },
    { scope: navRef, dependencies: [location.pathname], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      const sidebar = sidebarRef.current;
      if (!sidebar) {
        return;
      }
      const q = gsap.utils.selector(sidebar);
      const labels = q(".sidebar-label, .sidebar-group-label, .brand-copy");

      const mm = gsap.matchMedia();
      mm.add(mediaQueries.desktop, () => {
        gsap.to(sidebar, {
          width: collapsed ? 88 : 280,
          duration: window.matchMedia(mediaQueries.reducedMotion).matches ? 0 : motion.duration.normal,
          ease: motion.ease.enter
        });
        if (labels.length) {
          gsap.to(labels, {
            autoAlpha: collapsed ? 0 : 1,
            width: collapsed ? 0 : "auto",
            duration: window.matchMedia(mediaQueries.reducedMotion).matches ? 0 : motion.duration.fast,
            ease: motion.ease.enter
          });
        }
      });

      return () => mm.revert();
    },
    { scope: sidebarRef, dependencies: [collapsed], revertOnUpdate: true }
  );

  return (
    <div ref={shellRef} className="shell-surface min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-screen">
        <aside ref={sidebarRef} className="hidden w-[280px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)] lg:flex lg:flex-col">
          <SidebarContent collapsed={collapsed} onNavigate={() => undefined} navRef={navRef} />
          <div className="border-t border-[var(--border)] p-4">
            <Button className="w-full justify-center" variant="ghost" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? <ChevronRight aria-hidden="true" className="h-4 w-4" /> : <ChevronLeft aria-hidden="true" className="h-4 w-4" />}
              <span className="sidebar-label">{collapsed ? "" : "Collapse"}</span>
            </Button>
          </div>
        </aside>

        <Drawer open={mobileOpen} title="EcoSphere navigation" onClose={() => setMobileOpen(false)}>
          <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} mobile />
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="top-header sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-header)] px-[var(--space-page-x)] py-3 backdrop-blur">
            <div className="mx-auto w-full max-w-[var(--content-max)]">
            <div className="flex items-center gap-2 sm:gap-3">
              <IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu aria-hidden="true" className="h-4 w-4" />
              </IconButton>
              <div className="min-w-0 flex-1">
                <nav aria-label="Breadcrumb" className="hidden text-xs text-[var(--text-muted)] sm:block">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={`${crumb}-${index}`}>
                      {index > 0 ? <span aria-hidden="true"> / </span> : null}
                      <span>{crumb}</span>
                    </span>
                  ))}
                </nav>
                <p className="truncate text-sm font-medium text-white sm:mt-1">{routeMeta.title}</p>
              </div>
              <label className="hidden w-full max-w-xs items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] px-3 xl:flex">
                <Search aria-hidden="true" className="h-4 w-4 text-[var(--text-muted)]" />
                <Input aria-label="Search ESG records" className="border-0 bg-transparent px-0 focus-visible:outline-0" placeholder="Search ESG records" />
              </label>
              <HealthIndicator status={backendHealth.status} />
              <IconButton label="Notifications">
                <Bell aria-hidden="true" className="h-4 w-4" />
              </IconButton>
              <IconButton label="Open profile menu" onClick={() => setProfileOpen(true)}>
                <UserCircle aria-hidden="true" className="h-5 w-5" />
              </IconButton>
            </div>
            <nav aria-label="Top modules" className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {topModules.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                      isActive || location.pathname.startsWith(item.path.split("/")[1] ? `/${item.path.split("/")[1]}` : item.path)
                        ? "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                        : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-nested)] hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            </div>
          </header>

          <main id="main-content" className="min-w-0 flex-1 px-[var(--space-page-x)] py-[var(--space-page-y)]">
            <div className="mx-auto w-full max-w-[var(--content-max)]">
              <PageTransition routeKey={location.pathname}>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>

      <Modal open={profileOpen} title="Profile" onClose={() => setProfileOpen(false)}>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Manage account preferences, role context, and workspace settings from one focused menu.
        </p>
      </Modal>
    </div>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
  navRef,
  mobile = false
}: {
  collapsed: boolean;
  onNavigate: () => void;
  navRef?: React.RefObject<HTMLElement | null>;
  mobile?: boolean;
}) {
  return (
    <>
      <Link to="/dashboard" className="brand-mark flex items-center gap-3 border-b border-[var(--border)] p-4" onClick={onNavigate}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]">
          <BrandIcon aria-hidden="true" className="h-6 w-6" />
        </span>
        <span className="brand-copy min-w-0">
          <span className="block text-sm font-semibold text-white">EcoSphere</span>
          <span className="block text-xs text-[var(--text-muted)]">ESG Management</span>
        </span>
      </Link>
      <nav ref={navRef} aria-label={mobile ? "Mobile primary" : "Primary"} className="flex-1 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="sidebar-group-label mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {collapsed ? "" : group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `nav-item drawer-item relative flex min-h-11 items-center gap-3 overflow-hidden rounded-[var(--radius-sm)] px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                        isActive
                          ? "text-white"
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-nested)] hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`active-indicator absolute inset-0 origin-left rounded-[var(--radius-sm)] ${isActive ? "bg-[var(--status-success-bg)]" : ""}`} />
                        <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-md ${isActive ? "text-[var(--accent-green)]" : ""}`}>
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="sidebar-label relative z-10 min-w-0">
                          <span className="block truncate">{item.label}</span>
                          {!collapsed ? <span className="block truncate text-xs text-[var(--text-muted)]">{item.description}</span> : null}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

function HealthIndicator({ status }: { status: "loading" | "connected" | "error" }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set(ref.current, { autoAlpha: 1, scale: 1 });
      });
      mm.add(mediaQueries.motionSafe, () => {
        gsap.fromTo(ref.current, { scale: 0.92, autoAlpha: 0.65 }, { scale: 1, autoAlpha: 1, duration: motion.duration.fast, ease: motion.ease.enter });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [status], revertOnUpdate: true }
  );

  const tone = {
    loading: "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",
    connected: "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    error: "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"
  };

  return (
    <span ref={ref} className={`hidden rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex ${tone[status]}`}>
      System {status}
    </span>
  );
}
