export const motion = {
  duration: {
    fast: 0.16,
    normal: 0.42,
    slow: 0.72
  },
  stagger: {
    tight: 0.045,
    normal: 0.07,
    relaxed: 0.1
  },
  ease: {
    enter: "power3.out",
    exit: "power2.in",
    emphasis: "back.out(1.4)"
  },
  distance: {
    small: 8,
    medium: 18,
    large: 32
  },
  scale: {
    hover: 1.015,
    press: 0.985
  }
} as const;

export const mediaQueries = {
  desktop: "(min-width: 1024px)",
  touch: "(pointer: coarse)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  motionSafe: "(prefers-reduced-motion: no-preference)"
} as const;
