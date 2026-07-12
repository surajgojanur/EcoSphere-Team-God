import { useMemo, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandIcon } from "../app/navigation";
import { isApiError, type ApiFieldErrors } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { Button, Card, IconButton, Input, PageHeader } from "../components/ui/primitives";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const firstInvalidRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false
  });
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from && state.from !== "/login" && state.from !== "/register" ? state.from : "/dashboard";
  }, [location.state]);

  function setValue(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: [] }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSuccess(null);
    setGeneralError(null);
    const errors = validateForm(form, isLogin);
    setFieldErrors(errors);
    const firstError = Object.keys(errors).find((key) => errors[key]?.length);
    if (firstError) {
      window.setTimeout(() => firstInvalidRef.current?.focus(), 0);
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await auth.login({ email: form.email, password: form.password });
        navigate(from, { replace: true });
      } else {
        await auth.signup({ name: form.name, email: form.email, password: form.password });
        setSuccess("Account created. Please log in with your new credentials.");
        navigate("/login", { replace: true, state: { registeredEmail: form.email } });
      }
    } catch (error) {
      if (isApiError(error)) {
        setFieldErrors(error.fields ?? {});
        setGeneralError(error.message);
      } else {
        setGeneralError("Unable to complete the request.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[var(--text-primary)]">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(63,207,110,0.14)] text-[var(--accent-green)]">
            <BrandIcon aria-hidden="true" className="h-7 w-7" />
          </span>
          <PageHeader
            eyebrow="EcoSphere"
            title={isLogin ? "Enter the ESG command center" : "Create your EcoSphere account"}
            description="Track sustainability performance, manage governance risk, and connect daily participation to executive-ready ESG reporting."
          />
        </div>
        <Card>
          <h1 className="text-xl font-semibold text-white">{isLogin ? "Log in" : "Register"}</h1>
          {generalError ? <div className="mt-4 rounded-lg border border-[rgba(255,92,92,0.35)] bg-[rgba(255,92,92,0.08)] p-3 text-sm text-[var(--accent-red)]" role="alert">{generalError}</div> : null}
          {success ? <div className="mt-4 rounded-lg border border-[rgba(63,207,110,0.35)] bg-[rgba(63,207,110,0.08)] p-3 text-sm text-[var(--accent-green)]" role="status">{success}</div> : null}
          <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
            {!isLogin ? (
              <Field label="Full name" error={fieldErrors.name?.[0]}>
                <Input
                  ref={fieldErrors.name?.length ? firstInvalidRef : undefined}
                  className="mt-2 w-full"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setValue("name", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name?.length)}
                />
              </Field>
            ) : null}
            <Field label="Email" error={fieldErrors.email?.[0]}>
              <Input
                ref={fieldErrors.email?.length ? firstInvalidRef : undefined}
                className="mt-2 w-full"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(event) => setValue("email", event.target.value)}
                aria-invalid={Boolean(fieldErrors.email?.length)}
              />
            </Field>
            <Field label="Password" error={fieldErrors.password?.[0]}>
              <div className="mt-2 flex gap-2">
                <Input
                  ref={fieldErrors.password?.length ? firstInvalidRef : undefined}
                  className="w-full"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(event) => setValue("password", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password?.length)}
                />
                <IconButton label={showPassword ? "Hide password" : "Show password"} type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </IconButton>
              </div>
            </Field>
            {!isLogin ? (
              <>
                <Field label="Confirm password" error={fieldErrors.confirmPassword?.[0]}>
                  <Input
                    ref={fieldErrors.confirmPassword?.length ? firstInvalidRef : undefined}
                    className="mt-2 w-full"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(event) => setValue("confirmPassword", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.confirmPassword?.length)}
                  />
                </Field>
                <label className="flex gap-3 text-sm text-[var(--text-secondary)]">
                  <input
                    ref={fieldErrors.acceptedTerms?.length ? firstInvalidRef : undefined}
                    className="mt-1 h-4 w-4"
                    type="checkbox"
                    checked={form.acceptedTerms}
                    onChange={(event) => setValue("acceptedTerms", event.target.checked)}
                    aria-invalid={Boolean(fieldErrors.acceptedTerms?.length)}
                  />
                  <span>I understand this creates an employee account and does not grant administrator permissions.</span>
                </label>
                {fieldErrors.acceptedTerms?.[0] ? <p className="text-sm text-[var(--accent-red)]">{fieldErrors.acceptedTerms[0]}</p> : null}
              </>
            ) : null}
            <Button className="w-full" type="submit" isLoading={isSubmitting} aria-busy={isSubmitting}>
              {isLogin ? "Log in" : "Create account"}
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      {label}
      {children}
      {error ? <span className="mt-1 block text-[var(--accent-red)]">{error}</span> : null}
    </label>
  );
}

function validateForm(form: { name: string; email: string; password: string; confirmPassword: string; acceptedTerms: boolean }, isLogin: boolean): ApiFieldErrors {
  const errors: ApiFieldErrors = {};
  if (!isLogin && !form.name.trim()) errors.name = ["Enter your full name."];
  if (!form.email.trim()) errors.email = ["Enter your email address."];
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = ["Enter a valid email address."];
  if (!form.password) errors.password = ["Enter your password."];
  else if (!isLogin && form.password.length < 8) errors.password = ["Password must be at least 8 characters."];
  if (!isLogin && form.confirmPassword !== form.password) errors.confirmPassword = ["Passwords must match."];
  if (!isLogin && !form.acceptedTerms) errors.acceptedTerms = ["Confirm the account terms."];
  return errors;
}
