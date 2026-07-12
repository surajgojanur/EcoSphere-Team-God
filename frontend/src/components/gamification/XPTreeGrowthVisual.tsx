import { useEffect, useMemo } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
  type UseRiveParameters
} from "@rive-app/react-canvas";
import { Sprout } from "lucide-react";

const TREE_RIVE_SRC = "/treegrow_transparent.riv";
const TREE_STATE_MACHINE = "State Machine 1";
const TREE_PROGRESS_INPUT = "input";
const TREE_GROWTH_DURATION_MS = 1200;

export function XPTreeGrowthVisual({
  currentProgress,
  previousProgress,
  stage,
  deltaXp
}: {
  currentProgress: number;
  previousProgress: number;
  stage: string;
  deltaXp: number;
}) {
  const riveParams = useMemo<UseRiveParameters>(
    () => ({
      src: TREE_RIVE_SRC,
      stateMachines: TREE_STATE_MACHINE,
      autoplay: true,
      layout: new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center
      }),
      shouldDisableRiveListeners: true
    }),
    []
  );

  const { rive, RiveComponent } = useRive(riveParams, {
    shouldUseIntersectionObserver: true,
    shouldResizeCanvasToContainer: true
  });
  const progressInput = useStateMachineInput(
    rive,
    TREE_STATE_MACHINE,
    TREE_PROGRESS_INPUT,
    previousProgress
  );

  useEffect(() => {
    if (!rive) {
      return;
    }

    const stateMachineName = rive.stateMachineNames.includes(TREE_STATE_MACHINE)
      ? TREE_STATE_MACHINE
      : rive.stateMachineNames[0];

    if (stateMachineName) {
      rive.play(stateMachineName);
    }

    const startProgress = clampProgress(previousProgress);
    const endProgress = clampProgress(currentProgress);
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldReduceMotion || startProgress === endProgress) {
      if (progressInput) {
        progressInput.value = endProgress;
      }
      rive.resizeDrawingSurfaceToCanvas();
      return;
    }

    let animationFrame = 0;
    const startedAt = performance.now();

    const animateGrowth = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / TREE_GROWTH_DURATION_MS);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const treeProgress = startProgress + (endProgress - startProgress) * easedProgress;

      if (progressInput) {
        progressInput.value = treeProgress;
      }

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animateGrowth);
      }
    };

    rive.resizeDrawingSurfaceToCanvas();
    animationFrame = window.requestAnimationFrame(animateGrowth);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentProgress, previousProgress, progressInput, rive]);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--status-success-border)] bg-[linear-gradient(180deg,var(--status-success-bg),rgba(79,155,255,0.08))] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="metadata-text">Tree growth</p>
          <p className="mt-1 text-sm font-medium text-white">{stage}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--surface-primary)] text-[var(--status-success-text)]">
          <Sprout aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      <div className="relative mt-3 aspect-square min-h-44 overflow-hidden rounded-[var(--radius-sm)] bg-[radial-gradient(circle_at_center,var(--surface-raised),transparent_68%)] sm:min-h-60 xl:min-h-64">
        <RiveComponent className="h-full w-full" aria-label={`XP tree grown to ${currentProgress}%`} />
      </div>

      <div className="mt-4">
        <div className="relative h-3 rounded-full bg-[var(--surface-muted)]" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[rgba(255,255,255,0.18)]"
            style={{ width: `${previousProgress}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--accent-green),var(--accent-blue))]"
            style={{ width: `${currentProgress}%` }}
          />
          <span
            className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-white"
            style={{ left: `calc(${previousProgress}% - 2px)` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[var(--text-muted)]">
          <span>{previousProgress}% previous</span>
          <span className="text-center">+{deltaXp.toLocaleString()} XP</span>
          <span className="text-right">{currentProgress}% current</span>
        </div>
      </div>
    </div>
  );
}

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, progress));
}
