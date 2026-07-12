import type { RefObject } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { mediaQueries, motion } from "../../styles/motion";

export function useGamificationAnimation({
  scope,
  earnedXp,
  xpProgress
}: {
  scope: RefObject<HTMLElement | null>;
  earnedXp: number;
  xpProgress: number;
}) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) {
        return;
      }

      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(mediaQueries.reducedMotion, () => {
        gsap.set(q(".game-reveal, .badge-token, .leader-row, .reward-chip, .timeline-step"), {
          autoAlpha: 1,
          clearProps: "transform"
        });
        gsap.set(q(".xp-fill"), { scaleX: xpProgress / 100, transformOrigin: "left center" });
        q(".xp-number").forEach((node) => {
          node.textContent = earnedXp.toLocaleString();
        });
      });

      mm.add(mediaQueries.motionSafe, () => {
        const xpState = { value: 0 };

        gsap
          .timeline({
            defaults: { ease: motion.ease.enter },
            scrollTrigger: {
              trigger: root,
              start: "top 82%",
              end: "bottom 32%",
              scrub: 0.65
            }
          })
          .fromTo(q(".parallax-slow"), { yPercent: 8 }, { yPercent: -8, ease: "none" }, 0)
          .fromTo(q(".parallax-fast"), { yPercent: 16 }, { yPercent: -18, ease: "none" }, 0)
          .fromTo(q(".game-reveal"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.05)
          .fromTo(q(".xp-fill"), { scaleX: 0 }, { scaleX: xpProgress / 100, transformOrigin: "left center" }, 0.1)
          .to(
            xpState,
            {
              value: earnedXp,
              ease: "none",
              onUpdate: () => {
                q(".xp-number").forEach((node) => {
                  node.textContent = Math.round(xpState.value).toLocaleString();
                });
              }
            },
            0.1
          )
          .fromTo(q(".timeline-step"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.06 }, 0.18)
          .fromTo(q(".badge-token"), { autoAlpha: 0, y: 28, rotate: -4 }, { autoAlpha: 1, y: 0, rotate: 0, stagger: 0.08, ease: motion.ease.emphasis }, 0.25)
          .fromTo(q(".leader-row"), { autoAlpha: 0, x: 28 }, { autoAlpha: 1, x: 0, stagger: 0.06 }, 0.35)
          .fromTo(q(".reward-chip"), { autoAlpha: 0, y: 16, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.07 }, 0.45);

        gsap.to(q(".spark-path"), {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            end: "bottom 30%",
            scrub: true
          }
        });
      });

      return () => mm.revert();
    },
    { scope, dependencies: [earnedXp, xpProgress] }
  );
}
