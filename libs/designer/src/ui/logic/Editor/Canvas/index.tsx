import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Frames } from "./Frames";
import * as styles from "@paperclip-ui/designer/src/ui/editor.pc";
import { normalizeWheel } from "./normalize-wheel";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getCanvas,
  getCurrentDocument,
  getEditorState,
} from "@paperclip-ui/designer/src/state";
import { Tools } from "./Tools";

export const Canvas = (Base: React.FC<styles.BaseCanvasProps>) => () => {
  const { canvasRef, actualTransform, expanded, activeFrameIndex, visible } =
    useCanvas();

  return (
    <Base ref={canvasRef} innerProps={{
      style: {
        // Only want canvas to be visible after initially centered. Otherwise it feels janky
        opacity: visible ? 1 : 0,
        transform: `translateX(${actualTransform.x}px) translateY(${actualTransform.y}px) scale(${actualTransform.z}) translateZ(0)`,

        // fade in when centered for extra smoothness
        transition: "0.2s",
        transitionProperty: "opacity",
        transformOrigin: "top left",
      }
    }} frames={<Frames expandedFrameIndex={expanded ? activeFrameIndex : null} />} tools={<Tools />} />
  );
};

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
        dispatch({ type: "ui/canvasPanStart" });
      }
      const rect = canvasRef.current.getBoundingClientRect();

      // ignore jerky scroll - happens in VM for some reason.
      if (Math.abs(pixelX) > 100) {
        pixelX = pixelX / 100;
      }

      dispatch({
        type: "ui/canvasPanned",
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
          dispatch({ type: "ui/canvasPanEnd" });
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
        type: "ui/canvasResized",
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

  const visible = useSelector(getEditorState).centeredInitial;

  return {
    visible,
    canvasRef,
    actualTransform,
    expanded,
    activeFrameIndex: 0,
  };
};
