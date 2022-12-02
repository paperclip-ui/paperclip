import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  MutableRefObject,
} from "react";
import { Frames } from "./Frames";
import * as styles from "@paperclip-ui/designer/src/styles/editor.pc";
import { normalizeWheel } from "./normalize-wheel";
import { editorEvents } from "@paperclip-ui/designer/src//machine/events";

import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getCanvas,
  getCurrentDocument,
} from "@paperclip-ui/designer/src/machine/state";
import { Tools } from "./Tools";
import { useHotkeys } from "@paperclip-ui/designer/src/hooks/useHotkeys";

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
  const dispatch = useDispatch();
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
  useCanvasHotkeys(canvasRef as any);

  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      clearTimeout(canvasPanTimer);

      let { pixelX, pixelY } = normalizeWheel(event);
      if (!canvasRef.current) {
        return;
      }
      if (!canvasPanTimer) {
        dispatch(editorEvents.canvasPanStart());
      }
      const rect = canvasRef.current.getBoundingClientRect();

      // ignore jerky scroll - happens in VM for some reason.
      if (Math.abs(pixelX) > 100) {
        pixelX = pixelX / 100;
      }

      dispatch(
        editorEvents.canvasPanned({
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
        })
      );
      setCanvasPanTimer(
        setTimeout(() => {
          setCanvasPanTimer(null);
          dispatch(editorEvents.canvasPanEnd());
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
      dispatch(
        editorEvents.canvasResized({
          width,
          height,
        })
      );
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

const useCanvasHotkeys = (ref: MutableRefObject<HTMLElement>) => {
  const dispatch = useDispatch();
  useHotkeys(
    {
      e: () => dispatch(editorEvents.eHotkeyPressed()),
      t: () => dispatch(editorEvents.tHotkeyPressed()),
      backspace: () => dispatch(editorEvents.deleteHokeyPressed()),
      delete: () => dispatch(editorEvents.deleteHokeyPressed()),
      "meta+z": () => dispatch(editorEvents.undoKeyPressed()),
      "meta+shift+z": () => dispatch(editorEvents.redoKeyPressed()),
      "meta+s": () => dispatch(editorEvents.saveKeyComboPressed()),
    },
    ref
  );
};
