import { useCallback, useEffect, useRef, useState } from "react";

const PADDING = 12;

export const usePositioner = () => {
  const anchorRef = useRef<HTMLDivElement>();
  const [currentTargetRef, targetRef] = useState<HTMLDivElement>();

  const reposition = useCallback(() => {
    if (!anchorRef.current || !currentTargetRef) {
      return;
    }

    const bounds = anchorRef.current.getBoundingClientRect();

    Object.assign(currentTargetRef.style, {
      position: "fixed",
      zIndex: 9999,
      top: `${bounds.top}px`,
      minWidth: `${bounds.width}px`,
      scroll: "hidden",
      display: "inline-block",
    });

    const containerBounds = currentTargetRef.getBoundingClientRect();

    Object.assign(currentTargetRef.style, {
      left:
        Math.min(
          bounds.left,
          window.outerWidth - containerBounds.width - PADDING
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
