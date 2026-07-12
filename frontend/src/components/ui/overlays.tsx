import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP } from "../../lib/gsap";
import { mediaQueries, motion } from "../../styles/motion";
import { HighlightedHeadingText, IconButton } from "./primitives";

export function Drawer({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useOverlayFocus({
    open,
    panelRef,
    initialFocusRef: closeButtonRef,
    onClose
  });

  useGSAP(
    () => {
      if (!open) {
        return;
      }

      const root = scope.current;
      if (!root) {
        return;
      }

      const q = gsap.utils.selector(root);
      const backdrop = q(".drawer-backdrop");
      const panel = q(".drawer-panel");
      const items = q(".drawer-item");
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.duration.fast });
        gsap.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.duration.fast });
      });

      mm.add(mediaQueries.motionSafe, () => {
        const timeline = gsap.timeline();
        timeline
          .fromTo(
            backdrop,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: motion.duration.fast, ease: motion.ease.enter }
          )
          .fromTo(
            panel,
            { xPercent: -100, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: motion.duration.normal, ease: motion.ease.enter },
            "<"
          );
        if (items.length) {
          timeline.fromTo(
            items,
            { autoAlpha: 0, x: -10 },
            {
              autoAlpha: 1,
              x: 0,
              duration: motion.duration.fast,
              ease: motion.ease.enter,
              stagger: motion.stagger.tight
            },
            "-=0.12"
          );
        }
      });

      return () => mm.revert();
    },
    { scope, dependencies: [open], revertOnUpdate: true }
  );

  if (!open) {
    return null;
  }

  return (
    <div ref={scope} className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="drawer-backdrop absolute inset-0 bg-black/60" aria-hidden="true" onClick={onClose} />
      <aside ref={panelRef} className="drawer-panel absolute inset-y-0 left-0 flex w-[min(92vw,360px)] flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface-overlay)] p-4 shadow-overlay">
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="heading-copy text-lg font-bold text-white">
            <HighlightedHeadingText title={title} highlightClassName="heading-highlight-sm" />
          </h2>
          <IconButton label="Close navigation" onClick={onClose} ref={closeButtonRef}>
            <X aria-hidden="true" className="h-4 w-4" />
          </IconButton>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useOverlayFocus({
    open,
    panelRef,
    initialFocusRef: closeButtonRef,
    onClose
  });

  useGSAP(
    () => {
      if (!open) {
        return;
      }

      const root = scope.current;
      if (!root) {
        return;
      }

      const q = gsap.utils.selector(root);
      const backdrop = q(".modal-backdrop");
      const panel = q(".modal-panel");
      const mm = gsap.matchMedia();
      mm.add(mediaQueries.reducedMotion, () => {
        gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.duration.fast });
        gsap.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.duration.fast });
      });
      mm.add(mediaQueries.motionSafe, () => {
        gsap
          .timeline()
          .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.duration.fast })
          .fromTo(
            panel,
            { autoAlpha: 0, y: motion.distance.small, scale: 0.98 },
            { autoAlpha: 1, y: 0, scale: 1, duration: motion.duration.normal, ease: motion.ease.enter },
            "<"
          );
      });

      return () => mm.revert();
    },
    { scope, dependencies: [open], revertOnUpdate: true }
  );

  if (!open) {
    return null;
  }

  return (
    <div ref={scope} className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div aria-hidden="true" className="modal-backdrop absolute inset-0 bg-black/60" onClick={onClose} />
      <section ref={panelRef} className="modal-panel relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-overlay)] p-4 shadow-overlay sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="heading-copy text-xl font-bold text-white">
            <HighlightedHeadingText title={title} highlightClassName="heading-highlight-sm" />
          </h2>
          <IconButton label="Close dialog" onClick={onClose} ref={closeButtonRef}>
            <X aria-hidden="true" className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}

function useOverlayFocus({
  open,
  panelRef,
  initialFocusRef,
  onClose
}: {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      const target = initialFocusRef.current ?? getFocusableElements(panelRef.current)[0];
      target?.focus();
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      if (trigger?.isConnected) {
        trigger.focus();
      }
    };
  }, [initialFocusRef, onClose, open, panelRef]);
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
      ].join(",")
    )
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}
