import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";
import { Loader2 } from "lucide-react";
import { gsap, useGSAP } from "../../lib/gsap";
import { mediaQueries, motion } from "../../styles/motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
}>(function Button({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  ...props
}, forwardedRef) {
  const localRef = useRef<HTMLButtonElement>(null);
  const setRef = (node: HTMLButtonElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };
  const { contextSafe } = useGSAP();
  const base =
    "button-motion inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)] disabled:cursor-not-allowed disabled:opacity-45";
  const variants = {
    primary: "bg-[var(--accent-green)] text-[#07120b] hover:bg-[#6ce692]",
    secondary:
      "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-blue)]",
    ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]",
    danger: "bg-[var(--accent-red)] text-white hover:bg-[#ff7777]"
  };

  useGSAP(() => {
    const button = localRef.current;
    if (!button) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: mediaQueries.desktop,
        motionSafe: mediaQueries.motionSafe,
        reduced: mediaQueries.reducedMotion
      },
      (context) => {
        const { desktop, motionSafe } = context.conditions ?? {};
        if (!desktop || !motionSafe) {
          return;
        }

        const enter = contextSafe(() => {
          gsap.to(button, {
            scale: motion.scale.hover,
            duration: motion.duration.fast,
            ease: motion.ease.enter
          });
        });
        const leave = contextSafe(() => {
          gsap.to(button, {
            scale: 1,
            duration: motion.duration.fast,
            ease: motion.ease.enter
          });
        });
        const press = contextSafe(() => {
          gsap.to(button, {
            scale: motion.scale.press,
            duration: 0.08,
            ease: motion.ease.exit
          });
        });

        button.addEventListener("pointerenter", enter);
        button.addEventListener("pointerleave", leave);
        button.addEventListener("pointerdown", press);
        button.addEventListener("pointerup", leave);

        return () => {
          button.removeEventListener("pointerenter", enter);
          button.removeEventListener("pointerleave", leave);
          button.removeEventListener("pointerdown", press);
          button.removeEventListener("pointerup", leave);
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <button ref={setRef} className={`${base} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(function IconButton({
  label,
  children,
  className = "",
  ...props
}, ref) {
  return (
    <Button
      ref={ref}
      aria-label={label}
      className={`h-10 w-10 px-0 ${className}`}
      variant="secondary"
      title={label}
      {...props}
    >
      {children}
    </Button>
  );
});

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-soft ${className}`}>{children}</section>;
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const tones = {
    success: "bg-[rgba(63,207,110,0.15)] text-[var(--accent-green)]",
    warning: "bg-[rgba(245,197,66,0.15)] text-[var(--accent-yellow)]",
    danger: "bg-[rgba(255,92,92,0.15)] text-[var(--accent-red)]",
    info: "bg-[rgba(79,155,255,0.15)] text-[var(--accent-blue)]",
    neutral: "bg-[rgba(154,157,168,0.15)] text-[var(--text-secondary)]"
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="min-h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
      {...props}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[rgba(255,255,255,0.08)] ${className}`} />;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-[var(--accent-green)]" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <h2 className="text-base font-medium text-[var(--text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </Card>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description
}: {
  title?: string;
  description: string;
}) {
  return (
    <Card className="border-[rgba(255,92,92,0.35)]">
      <h2 className="text-base font-medium text-[var(--accent-red)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-green)]">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-white md:text-[28px]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-[var(--text-primary)]">{title}</h2>
      {description ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p> : null}
    </div>
  );
}
