import { useCallback, useEffect, useRef, useState } from "react";

const PADDING = 12;

type PositionProps = {
  y: "top" | "bottom" | "center";
  x: "left" | "right" | "center";
};

export const usePositioner = (
  { x, y }: PositionProps = { x: "left", y: "top" }
) => {
  const anchorRef = useRef<HTMLDivElement>();
  const [currentTargetRef, targetRef] = useState<HTMLDivElement>();

  const leftMultiplier = x === "left" ? 0 : x === "right" ? 1 : 0.5;
  const topMultiplier = y === "top" ? 0 : y === "bottom" ? 1 : 0.5;

  const reposition = useCallback(() => {
    if (!anchorRef.current || !currentTargetRef) {
      return;
    }

    const bounds = anchorRef.current.getBoundingClientRect();

    Object.assign(currentTargetRef.style, {
      position: "fixed",
      zIndex: 9999,
      top: `${bounds.top + bounds.height * topMultiplier}px`,

      // don't want this because it messes with actual min width
      // minWidth: `${bounds.width}px`,
      scroll: "hidden",
      display: "inline-block",
    });

    const containerBounds = currentTargetRef.getBoundingClientRect();

    Object.assign(currentTargetRef.style, {
      left:
        Math.min(
          bounds.left + bounds.width * leftMultiplier,
          window.innerWidth - containerBounds.width - PADDING
        ) + "px",
    });
  }, [anchorRef.current, currentTargetRef]);

  useEffect(() => {
    if (!anchorRef.current || !currentTargetRef) {
      return;
    }

    window.addEventListener("scroll", reposition);
    window.addEventListener("resize", reposition);
    reposition();

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
    };
  }, [anchorRef.current, currentTargetRef, reposition]);

  return { anchorRef, targetRef };
};
