import React, { memo, useCallback, useRef, useState } from "react";
import * as styles from "./index.pc";
import { Node as VirtNode } from "@paperclip-ui/proto/lib/generated/virt/html";
import { Transform, Point } from "@paperclip-ui/designer/src/state/geom";

import {
  DEFAULT_FRAME_BOX,
  getCurrentDependency,
  getCurrentDocument,
  getGraph,
} from "@paperclip-ui/designer/src/state";
import { virtHTML } from "@paperclip-ui/core/lib/proto/virt/html-utils";
import { metadataValueMapToJSON } from "@paperclip-ui/proto/lib/virt/html-utils";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import {
  TextNode,
  Element,
  Component,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

export type FramesProps = {
  canvasScroll: Point;
  frames: VirtNode[];
  canvasTransform: Transform;
  readonly: boolean;
};

export const Frames = memo(
  ({ canvasScroll, frames, canvasTransform, readonly }: FramesProps) => {
    return (
      <>
        {frames.map((frame, i) => {
          return (
            <Frame
              key={i}
              canvasScroll={canvasScroll}
              frameIndex={i}
              frame={frame}
              canvasTransform={canvasTransform}
              readonly={readonly}
            />
          );
        })}
      </>
    );
  }
);

type FrameProps = {
  canvasScroll: Point;
  frame: VirtNode;
  frameIndex: number;
  canvasTransform: Transform;
  readonly: boolean;
};

const Frame = memo(
  ({
    frame,
    canvasScroll,
    frameIndex,
    canvasTransform,
    readonly,
  }: FrameProps) => {
    const { frame: bounds } = metadataValueMapToJSON(
      (frame.element || frame.textNode).metadata
    );
    // const dep = useSelector(getCurrentDependency);

    const graph = useSelector(getGraph);
    const dispatch = useDispatch<DesignerEvent>();

    // we want top-most
    const expr = ast.getExprInfoById(
      (frame.element?.id ?? frame.textNode?.id).split(".").shift(),
      graph
    );

    // could be component which is NOT rendered
    const frameExpr =
      (expr &&
        ast.getParentExprInfo(expr.expr.id, graph)?.kind ===
          ast.ExprKind.Render &&
        ast.getExprOwnerComponent(expr.expr, graph)) ||
      expr?.expr;

    const title =
      (frameExpr as Element | TextNode | Component)?.name ?? "Undefined";

    const frameBounds = bounds ?? DEFAULT_FRAME_BOX;
    const [editing, setEditing] = useState(false);

    const onClick = useCallback((event: React.MouseEvent<any>) => {
      console.log("frame");
      dispatch({
        type: "ui/frameTitleClicked",
        payload: { frameId: expr.expr.id },
      });

      // prevent canvas click event
      event.stopPropagation();
    }, []);
    const inputRef = useRef<HTMLInputElement>();

    const onDoubleClick = useCallback(() => {
      if (readonly) {
        return;
      }
      setEditing(true);
      setTimeout(() => {
        inputRef.current.select();
      }, 50);
    }, [inputRef, readonly, setEditing]);

    const onChanged = useCallback(() => {
      if (!editing) {
        return;
      }

      setEditing(false);
      // dispatch(
      //   editorEvents.frameTitleChanged({ frameIndex, value: inputRef.current.value })
      // );
    }, [editing, inputRef, frameIndex, setEditing]);
    const onBlur = onChanged;
    // useEffect(() => {
    //   inputRef.current.value = annotations.frame?.title || "";
    // }, [inputRef, annotations.frame?.title]);

    const onKeyPress = useCallback(
      (event: React.KeyboardEvent<any>) => {
        if (event.key === "Enter") {
          onChanged();
        }
      },
      [onChanged]
    );

    const left =
      (frameBounds.x - canvasScroll.x) * canvasTransform.z + canvasTransform.x;
    const top =
      (frameBounds.y - canvasScroll.y) * canvasTransform.z + canvasTransform.y;

    return (
      <styles.Frame
        style={{
          left: 0,
          top: 0,
          width: frameBounds.width * canvasTransform.z,
          height: frameBounds.height * canvasTransform.z,
          transform: `translateX(${left}px) translateY(${top}px) translateZ(0)`,
          transformOrigin: "top left",
          position: "absolute",
        }}
      >
        <styles.FrameTitle
          // onBlur={onBlur}
          // onKeyPress={onKeyPress}
          onDoubleClick={onDoubleClick}
          // inputRef={inputRef}
          onMouseUp={onClick}
          value={title}
        />
      </styles.Frame>
    );
  }
);
