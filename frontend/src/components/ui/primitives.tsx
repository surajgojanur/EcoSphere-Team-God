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
type CardVariant = "primary" | "nested" | "raised";
type CardDensity = "comfortable" | "compact" | "spacious";
type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "critical" | "high" | "medium" | "low";

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
    "button-motion inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45";
  const variants = {
    primary: "bg-[var(--accent-green)] text-[var(--text-inverse)] hover:bg-[#6ce692]",
    secondary:
      "border border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:border-[var(--focus-ring)] hover:bg-[var(--surface-raised)]",
    ghost: "text-[var(--text-secondary)] hover:bg-[var(--surface-nested)] hover:text-[var(--text-primary)]",
    danger: "bg-[var(--status-danger-text)] text-white hover:bg-[#ff8585]"
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
  className = "",
  variant = "primary",
  density = "comfortable"
}: {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  density?: CardDensity;
}) {
  const variants = {
    primary: "border-[var(--border)] bg-[var(--surface-primary)]",
    nested: "border-[var(--border)] bg-[var(--surface-nested)]",
    raised: "border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-soft"
  };
  const densities = {
    compact: "p-3 sm:p-4",
    comfortable: "p-4 sm:p-5",
    spacious: "p-4 sm:p-6"
  };

  return <section className={`rounded-[var(--radius-md)] border ${variants[variant]} ${densities[density]} ${className}`}>{children}</section>;
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const tones = {
    success: "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
    warning: "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",
    danger: "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]",
    info: "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
    neutral: "border-[var(--status-neutral-border)] bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]",
    critical: "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]",
    high: "border-[var(--status-high-border)] bg-[var(--status-high-bg)] text-[var(--status-high-text)]",
    medium: "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",
    low: "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]"
  };

  return <span className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-medium leading-4 ${tones[tone]}`}>{children}</span>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-nested)] px-3 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
      {...props}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-muted)] ${className}`} />;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-primary)] p-5 text-sm text-[var(--text-secondary)]">
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
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-nested)] p-6 text-center">
      <h2 className="heading-copy text-xl font-bold text-[var(--text-primary)]">
        <HighlightedHeadingText title={title} highlightClassName="heading-highlight-sm" />
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
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
    <Card className="border-[var(--status-danger-border)]" variant="nested">
      <h2 className="heading-copy text-xl font-bold text-[var(--status-danger-text)]">
        <HighlightedHeadingText title={title} highlightClassName="heading-highlight-sm" />
      </h2>
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
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-green)]">{eyebrow}</p>
        <h1 className="heading-copy mt-2 text-[clamp(1.75rem,1.35rem+1.4vw,2.5rem)] font-bold leading-[1.05] tracking-normal text-white">
          <HighlightedHeadingText title={title} highlightClassName="heading-highlight-lg" />
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>
      {actions ? <div className="grid w-full shrink-0 grid-cols-1 gap-2 sm:w-auto sm:grid-flow-col sm:auto-cols-max">{actions}</div> : null}
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
      <h2 className="heading-copy text-xl font-bold text-[var(--text-primary)]">
        <HighlightedHeadingText title={title} highlightClassName="heading-highlight-sm" />
      </h2>
      {description ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p> : null}
    </div>
  );
}

export function HighlightedHeadingText({
  title,
  highlightClassName
}: {
  title: string;
  highlightClassName: string;
}) {
  const words = title.trim().split(/\s+/);
  const highlight = words.pop();
  const lead = words.join(" ");

  if (!highlight) {
    return <>{title}</>;
  }

  return (
    <>
      {lead ? `${lead} ` : null}
      <span className={`heading-highlight ${highlightClassName}`}>{highlight}</span>
    </>
  );
}
