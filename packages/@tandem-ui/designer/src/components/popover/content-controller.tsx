import { Bounds, mergeBounds, getBoundsSize, Point } from "tandem-common";
import { BaseContentProps } from "./view.pc";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const calcPortalPosition = (
  centered: boolean,
  anchorRect: Bounds,
  portalRect: Bounds
) => {
  const portalSize = getBoundsSize(portalRect);
  const anchorSize = getBoundsSize(anchorRect);
  return {
    left: Math.min(
      anchorRect.left +
        (centered ? (anchorRect.right - anchorRect.left) / 2 : 0),
      window.innerWidth - portalSize.width
    ),
    top: Math.min(
      anchorRect.top + anchorSize.height,
      window.innerHeight - portalSize.height
    ),
  };
};

const usePortal = () => {
  const [portal, setPortal] = useState<HTMLDivElement>(null);
  useEffect(() => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);
    setPortal(mount);

    return () => {
      mount.remove();
    };
  }, []);

  return portal;
};

// ick, but okay for now. Will need to change
// when tests are added
let _popoverCount = 0;

export type Props = {
  onShouldClose: any;
  centered?: boolean;
  anchorRect: Bounds;
  children?: any;
  updateContentPosition?: (position: Point, rect: Bounds) => Point;
} & BaseContentProps;

export default (Base: React.FC<BaseContentProps>) =>
  ({
    centered,
    updateContentPosition,
    onShouldClose,
    children,
    anchorRect,
    ...rest
  }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const portal = usePortal();
    const [style, setStyle] = useState<any>({});

    useEffect(() => {
      const onScroll = (event) => {
        if (!containerRef?.current?.contains(event.target)) {
          onShouldClose();
        }
      };
      const onMouseDown = (event) => {
        if (!containerRef?.current?.contains(event.target)) {
          onShouldClose();
        }
      };
      document.addEventListener("scroll", onScroll, true);
      document.addEventListener("mousedown", onMouseDown, true);
      return () => {
        document.removeEventListener("scroll", onScroll, true);
        document.removeEventListener("mousedown", onMouseDown, true);
      };
    }, [containerRef?.current]);

    useEffect(() => {
      if (!wrapperRef.current || !portal || !anchorRect) {
        return;
      }
      const popoverRect = calcInnerBounds(wrapperRef.current);

      let position = calcPortalPosition(centered, anchorRect, popoverRect);

      if (updateContentPosition) {
        position = updateContentPosition(position, popoverRect);
      }
      const newStyle = {
        position: "fixed",
        zIndex: 1024,
        ...position,
      };

      setStyle(newStyle);
    }, [anchorRect, wrapperRef, portal]);

    return (
      anchorRect && (
        <div ref={wrapperRef}>
          {portal &&
            createPortal(
              <Base {...rest}>
                <div ref={containerRef} style={style}>
                  {children}
                </div>
              </Base>,
              portal
            )}
        </div>
      )
    );
  };

const calcInnerBounds = (
  element: HTMLElement,
  maxDepth: number = 0,
  depth: number = 0
): Bounds => {
  const rect: ClientRect = element.getBoundingClientRect();
  if (depth >= maxDepth) return rect;
  return mergeBounds(
    ...Array.from(element.children).reduce(
      (rects, child: HTMLElement) => {
        return [...rects, calcInnerBounds(child)];
      },
      [rect]
    )
  );
};
