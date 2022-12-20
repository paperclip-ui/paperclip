import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Frames } from "./Frames";
import * as styles from "@paperclip-ui/designer/src/styles/editor.pc";
import { normalizeWheel } from "./normalize-wheel";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getCanvas,
  getCurrentDocument,
} from "@paperclip-ui/designer/src/state";
import { Tools } from "./Tools";

export const Canvas = React.memo(() => {
  const { canvasRef, actualTransform, expanded, activeFrameIndex } =
    useCanvas();

  return (
    <styles.Canvas ref={canvasRef}>
      <styles.CanvasInner
        style={{
          transform: `translateX(${actualTransform.x}px) translateY(${actualTransform.y}px) scale(${actualTransform.z}) translateZ(0)`,
          transformOrigin: "top left",
        }}
      >
        <Frames expandedFrameIndex={expanded ? activeFrameIndex : null} />
      </styles.CanvasInner>
      <Tools />
    </styles.Canvas>
  );
});

const useCanvas = () => {
  const canvas = useSelector(getCanvas);
  const currentDocument = useSelector(getCurrentDocument);
  const dispatch = useDispatch<DesignerEvent>();
  const expanded = canvas.isExpanded;

  const actualTransform = useMemo(() => {
    if (expanded) {
      const frame =
        currentDocument!.paperclip!.html!.children[canvas!.activeFrame];
      if (!frame) {
        return canvas.transform;
      }
      const frameBounds =
        frame && (frame.element || frame.textNode).metadata.bounds;
      return {
        x: -frameBounds.x,
        y: -frameBounds.y,
        z: 1,
      };
    } else {
      return canvas.transform;
    }
  }, [canvas.transform, expanded]);

  const [canvasPanTimer, setCanvasPanTimer] = useState<any>(0);

  const canvasRef = useRef<HTMLElement>();

  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      clearTimeout(canvasPanTimer);

      let { pixelX, pixelY } = normalizeWheel(event);
      if (!canvasRef.current) {
        return;
      }
      if (!canvasPanTimer) {
        dispatch({ type: "editor/canvasPanStart" });
      }
      const rect = canvasRef.current.getBoundingClientRect();

      // ignore jerky scroll - happens in VM for some reason.
      if (Math.abs(pixelX) > 100) {
        pixelX = pixelX / 100;
      }

      dispatch({
        type: "editor/canvasPanned",
        payload: {
          delta: {
            x: pixelX,
            y: pixelY,
          },
          mousePosition: {
            x: event.pageX - window.scrollX - rect.left,
            y: event.pageY - window.scrollY - rect.top,
          },
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          size: {
            width: rect.width,
            height: rect.height,
          },
        },
      });
      setCanvasPanTimer(
        setTimeout(() => {
          setCanvasPanTimer(null);
          dispatch({ type: "designer/canvasPanEnd" });
        }, 100)
      );

      return false;
    },
    [canvasRef, dispatch, setCanvasPanTimer]
  );

  useEffect(() => {
    const ref = canvasRef.current;
    if (!ref) {
      return;
    }

    const onResize = () => {
      const { width, height } = ref.getBoundingClientRect();
      dispatch({
        type: "editor/canvasResized",
        payload: {
          width,
          height,
        },
      });
    };
    const obs = new ResizeObserver(onResize);
    obs.observe(ref);

    ref.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    requestAnimationFrame(onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      obs.disconnect();
      ref.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef]);

  return {
    canvasRef,
    actualTransform,
    expanded,
    activeFrameIndex: canvas.activeFrame,
  };
};
