import React, { useCallback, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { useRef } from "react";

export type PortalProps = {
  children: any;
};
const PADDING = 10;

export const Portal = ({ children }: PortalProps) => {
  const portalRef = useRef<HTMLDivElement>();
  const container = useMemo(() => {
    return document.createElement("div");
  }, []);

  useEffect(() => {
    document.body.appendChild(container);

    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  const reposition = useCallback(() => {
    if (!portalRef.current) {
      return;
    }
    const bounds = portalRef.current.getBoundingClientRect();

    Object.assign(container.style, {
      position: "fixed",
      zIndex: 9999,
      top: bounds.top,
      minWidth: bounds.width,
      display: "inline-blcok",
    });

    const containerBounds = container.getBoundingClientRect();
    console.log(bounds.width, window.screen.width, containerBounds.width);

    Object.assign(container.style, {
      left: Math.min(
        bounds.left,
        window.screen.width - containerBounds.width - PADDING
      ),
    });
  }, [container, portalRef.current]);

  useEffect(() => {
    if (!portalRef.current) {
      return;
    }

    window.addEventListener("resize", reposition);
    reposition();

    return () => {
      window.removeEventListener("resize", reposition);
    };
  }, [container, reposition]);

  return (
    <div ref={portalRef}>{ReactDOM.createPortal(children, container)}</div>
  );
};
