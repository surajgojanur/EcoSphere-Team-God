import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { BarChart3, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";
import { BrandIcon } from "../app/navigation";
import { Button, Card, HighlightedHeadingText, Input, PageHeader } from "../components/ui/primitives";
import { gsap, useGSAP } from "../lib/gsap";
import { mediaQueries, motion } from "../styles/motion";

const demoAccounts = [
  { role: "Admin", email: "admin@ecosphere.test", scope: "Full configuration" },
  { role: "ESG Manager", email: "manager@ecosphere.test", scope: "Approvals and reports" },
  { role: "Employee", email: "employee@ecosphere.test", scope: "Participation flow" },
  { role: "Auditor", email: "auditor@ecosphere.test", scope: "Audit review" }
];

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const heroRef = useRef<HTMLElement>(null);
  const { contextSafe } = useGSAP();
  const navigate = useNavigate();

  const enterDashboard = () => {
    navigate("/dashboard");
  };

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) {
        return;
      }

      const q = gsap.utils.selector(hero);
      const layers = q("[data-parallax-layer]");
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set(layers, { autoAlpha: 1, clearProps: "transform" });
      });

      mm.add(
        {
          desktop: mediaQueries.desktop,
          motionSafe: mediaQueries.motionSafe,
          touch: mediaQueries.touch
        },
        (context) => {
          const { desktop, motionSafe, touch } = context.conditions ?? {};
          if (!desktop || !motionSafe || touch) {
            return;
          }

          gsap.fromTo(
            layers,
            { autoAlpha: 0, y: motion.distance.medium },
            { autoAlpha: 1, y: 0, duration: motion.duration.slow, ease: motion.ease.enter, stagger: motion.stagger.relaxed }
          );

          const layerSetters = layers.map((layer, index) => ({
            x: gsap.quickTo(layer, "x", { duration: motion.duration.normal, ease: motion.ease.enter }),
            y: gsap.quickTo(layer, "y", { duration: motion.duration.normal, ease: motion.ease.enter }),
            depth: (index + 1) * 5
          }));

          const move = contextSafe((event: PointerEvent) => {
            const bounds = hero.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            layerSetters.forEach((layer) => {
              layer.x(x * layer.depth);
              layer.y(y * layer.depth * 0.7);
            });
          });

          const leave = contextSafe(() => {
            layerSetters.forEach((layer) => {
              layer.x(0);
              layer.y(0);
            });
          });

          hero.addEventListener("pointermove", move);
          hero.addEventListener("pointerleave", leave);

          return () => {
            hero.removeEventListener("pointermove", move);
            hero.removeEventListener("pointerleave", leave);
          };
        }
      );

      mm.add(mediaQueries.motionSafe, () => {
        gsap.to(q(".hero-scroll-plane"), {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      });

      return () => mm.revert();
    },
    { scope: heroRef }
  );

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-[var(--space-page-x)] py-[var(--space-page-y)] text-[var(--text-primary)]">
      <section ref={heroRef} className="relative mx-auto grid min-h-[calc(100vh-(var(--space-page-y)*2))] w-full max-w-[1500px] items-center gap-6 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] xl:gap-10">
        <div className="relative py-6 sm:py-10">
          <div aria-hidden="true" className="hero-scroll-plane pointer-events-none absolute inset-0 hidden lg:block">
            <div data-parallax-layer className="absolute left-[8%] top-[10%] h-24 w-56 rounded-[var(--radius-md)] border border-[var(--status-info-border)] bg-[var(--status-info-bg)] opacity-50" />
            <div data-parallax-layer className="absolute right-[12%] top-[4%] h-36 w-36 rounded-[var(--radius-md)] border border-[var(--status-success-border)] bg-[var(--status-success-bg)] opacity-45" />
            <div data-parallax-layer className="absolute bottom-[6%] left-[18%] h-20 w-72 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] opacity-55" />
          </div>

          <div className="relative max-w-2xl">
            <span data-parallax-layer className="inline-grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]">
              <BrandIcon aria-hidden="true" className="h-7 w-7" />
            </span>
            <div data-parallax-layer>
              <PageHeader
                eyebrow="EcoSphere"
                title={isLogin ? "Enter the ESG command center" : "Create your EcoSphere account"}
                description="Track sustainability performance, manage governance risk, and connect daily participation to executive-ready ESG reporting."
              />
            </div>
          </div>

          <div aria-hidden="true" className="relative mt-8 hidden max-w-xl lg:block">
            <div data-parallax-layer className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(25,28,35,0.78)] p-4 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
                <span className="metadata-text">ESG operating view</span>
                <span className="rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-2 py-1 text-xs font-medium text-[var(--status-success-text)]">Live</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Score", value: "84.2", icon: BarChart3 },
                  { label: "Actions", value: "18", icon: CheckCircle2 },
                  { label: "Risk", value: "2", icon: ShieldCheck }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3">
                      <Icon aria-hidden="true" className="h-4 w-4 text-[var(--accent-blue)]" />
                      <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                      <p className="metadata-text mt-1">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Card className="relative z-10 w-full justify-self-center" variant="raised">
          <h1 className="heading-copy text-2xl font-bold text-white">
            <HighlightedHeadingText title={isLogin ? "Log in" : "Register"} highlightClassName="heading-highlight-lg" />
          </h1>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              enterDashboard();
            }}
          >
            <label className="block text-sm text-[var(--text-secondary)]">
              Email
              <Input className="mt-2 w-full" type="email" placeholder="name@company.com" />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Password
              <Input className="mt-2 w-full" type="password" placeholder="Minimum 8 characters" />
            </label>
            <Button className="w-full" type="submit">
              {isLogin ? "Log in" : "Create account"}
            </Button>
          </form>

          {isLogin ? (
            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">Demo logins</p>
                <span className="metadata-text">No password required</span>
              </div>
              <div className="grid gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] p-3 text-left transition-colors hover:border-[var(--focus-ring)] hover:bg-[var(--surface-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    type="button"
                    onClick={enterDashboard}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]">
                      <UserCheck aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white">{account.role}</span>
                      <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{account.email}</span>
                    </span>
                    <span className="hidden max-w-28 text-right text-xs text-[var(--text-secondary)] sm:block lg:max-w-32">{account.scope}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            {isLogin ? "Need an account?" : "Already have an account?"}{" "}
            <Link className="text-[var(--accent-green)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Register" : "Log in"}
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
