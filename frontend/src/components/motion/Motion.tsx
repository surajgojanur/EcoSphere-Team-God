import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { mediaQueries, motion } from "../../styles/motion";

/**
 * PageTransition reveals route content on route changes.
 * Reduced motion uses an immediate/short opacity reveal.
 * Cleanup is handled by useGSAP context reversion.
 */
export function PageTransition({
  children,
  routeKey
}: {
  children: ReactNode;
  routeKey: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = scope.current;
      if (!element) {
        return;
      }

      const q = gsap.utils.selector(element);
      const revealItems = q(".page-reveal");
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.fromTo(
          element,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: motion.duration.fast, ease: motion.ease.enter }
        );
      });

      mm.add(mediaQueries.motionSafe, () => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: motion.distance.small },
          { autoAlpha: 1, y: 0, duration: motion.duration.normal, ease: motion.ease.enter }
        );
        if (revealItems.length) {
          gsap.fromTo(
            revealItems,
            { autoAlpha: 0, y: motion.distance.medium },
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.duration.normal,
              ease: motion.ease.enter,
              stagger: motion.stagger.tight
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope, dependencies: [routeKey], revertOnUpdate: true }
  );

  return (
    <div ref={scope} className="min-w-0">
      {children}
    </div>
  );
}

/**
 * Reveal animates a small content block into view.
 * Reduced motion skips movement and reveals opacity only.
 * Cleanup is handled by useGSAP context reversion.
 */
export function Reveal({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!scope.current) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set(scope.current, { autoAlpha: 1 });
      });

      mm.add(mediaQueries.motionSafe, () => {
        gsap.fromTo(
          scope.current,
          { autoAlpha: 0, y: motion.distance.small },
          { autoAlpha: 1, y: 0, duration: motion.duration.normal, ease: motion.ease.enter }
        );
      });

      return () => mm.revert();
    },
    { scope }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

/**
 * StaggerGroup reveals child elements with the provided selector.
 * Reduced motion makes children visible immediately.
 * Cleanup is handled by useGSAP context reversion.
 */
export function StaggerGroup({
  children,
  className = "",
  childSelector = ".stagger-item"
}: {
  children: ReactNode;
  className?: string;
  childSelector?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = scope.current;
      if (!element) {
        return;
      }

      const q = gsap.utils.selector(element);
      const children = q(childSelector);
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        if (children.length) {
          gsap.set(children, { autoAlpha: 1, y: 0, scale: 1 });
        }
      });

      mm.add(mediaQueries.motionSafe, () => {
        if (children.length) {
          gsap.fromTo(
            children,
            { autoAlpha: 0, y: motion.distance.medium, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: motion.duration.normal,
              ease: motion.ease.enter,
              stagger: motion.stagger.normal
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope }
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

/**
 * MotionCard adds desktop-only hover lift and optional subtle pointer tilt.
 * Reduced motion and touch devices receive static cards.
 * Cleanup removes pointer listeners through GSAP context.
 */
export function MotionCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP();

  useGSAP(
    () => {
      const element = scope.current;
      if (!element) {
        return;
      }

      const mm = gsap.matchMedia();

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

          const tiltX = gsap.quickTo(element, "rotationX", {
            duration: motion.duration.fast,
            ease: motion.ease.enter
          });
          const tiltY = gsap.quickTo(element, "rotationY", {
            duration: motion.duration.fast,
            ease: motion.ease.enter
          });

          const enter = contextSafe(() => {
            gsap.to(element, {
              y: -4,
              boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
              duration: motion.duration.fast,
              ease: motion.ease.enter
            });
          });

          const move = contextSafe((event: PointerEvent) => {
            const bounds = element.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            tiltX(y * -2);
            tiltY(x * 2);
          });

          const leave = contextSafe(() => {
            tiltX(0);
            tiltY(0);
            gsap.to(element, {
              y: 0,
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
              duration: motion.duration.normal,
              ease: motion.ease.enter
            });
          });

          element.addEventListener("pointerenter", enter);
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", leave);

          return () => {
            element.removeEventListener("pointerenter", enter);
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", leave);
          };
        }
      );

      return () => mm.revert();
    },
    { scope }
  );

  return (
    <div ref={scope} className={`motion-card will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/**
 * AnimatedNumber centralizes metric formatting for future counter tweens.
 * Reduced motion displays the final string immediately.
 * Cleanup is handled by useGSAP context reversion.
 */
export function AnimatedNumber({
  value,
  suffix = ""
}: {
  value: string;
  suffix?: string;
}) {
  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}
