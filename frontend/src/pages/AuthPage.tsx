import { Link } from "react-router-dom";
import { BrandIcon } from "../app/navigation";
import { Button, Card, Input, PageHeader } from "../components/ui/primitives";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[var(--text-primary)]">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(63,207,110,0.14)] text-[var(--accent-green)]">
            <BrandIcon aria-hidden="true" className="h-7 w-7" />
          </span>
          <PageHeader
            eyebrow="EcoSphere"
            title={isLogin ? "Log in to the ESG command center" : "Create an employee account"}
            description="Authentication is scheduled for Phase 2. This placeholder preserves routing, design language and accessibility structure."
          />
        </div>
        <Card>
          <h1 className="text-xl font-semibold text-white">{isLogin ? "Log in" : "Register"}</h1>
          <form className="mt-5 space-y-4">
            <label className="block text-sm text-[var(--text-secondary)]">
              Email
              <Input className="mt-2 w-full" type="email" placeholder="name@company.com" />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Password
              <Input className="mt-2 w-full" type="password" placeholder="Minimum 8 characters" />
            </label>
            <Button className="w-full" type="button">
              {isLogin ? "Log in placeholder" : "Register placeholder"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            {isLogin ? "Need an account?" : "Already have an account?"}{" "}
            <Link className="text-[var(--accent-green)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]" to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Register" : "Log in"}
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
