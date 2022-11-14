import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as styles from "./index.pc";
import { Node as VirtNode } from "@paperclip-ui/proto/lib/virt/html";
import { Transform } from "@paperclip-ui/designer/src/machine/state/geom";
import { useDispatch } from "@paperclip-ui/common";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";
import { DEFAULT_FRAME_BOX } from "@paperclip-ui/designer/src/machine/state";

export type FramesProps = {
  frames: VirtNode[];
  canvasTransform: Transform;
  readonly: boolean;
};

export const Frames = memo(
  ({ frames, canvasTransform, readonly }: FramesProps) => {
    return (
      <>
        {frames.map((frame, i) => {
          return (
            <Frame
              key={i}
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
  frame: VirtNode;
  frameIndex: number;
  canvasTransform: Transform;
  readonly: boolean;
};

const Frame = memo(
  ({ frame, frameIndex, canvasTransform, readonly }: FrameProps) => {
    const dispatch = useDispatch();

    const metadata = (frame.element || frame.textNode).metadata;
    const frameBounds = metadata?.bounds || DEFAULT_FRAME_BOX;
    const [editing, setEditing] = useState(false);

    const onClick = useCallback((event: React.MouseEvent<any>) => {
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
    return (
      <styles.Frame
        style={{
          left: 0,
          top: 0,
          width: frameBounds.width * canvasTransform.z,
          height: "auto",
          transform: `translateX(${
            canvasTransform.x + frameBounds.x * canvasTransform.z
          }px) translateY(${
            canvasTransform.y + frameBounds.y * canvasTransform.z
          }px) translateZ(0)`,
          transformOrigin: "top left",
        }}
      >
        <styles.FrameTitle
          editing={editing}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          onDoubleClick={onDoubleClick}
          inputRef={inputRef}
          onMouseUp={onClick}
          // value={annotations.frame?.title || "Untitled"}
        />
      </styles.Frame>
    );
  }
);
