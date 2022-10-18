import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as styles from "./index.pc";
import { Node } from "@paperclip-ui/proto/lib/virt/html_pb";
import { Transform } from "@paperclip-ui/designer/src/editor/machine/state/geom";
import { useDispatch } from "@paperclip-ui/common";
import { editorEvents } from "@paperclip-ui/designer/src/editor/machine/events";

export type FramesProps = {
  frames: Node.AsObject[];
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
  frame: Node.AsObject;
  frameIndex: number;
  canvasTransform: Transform;
  readonly: boolean;
};

const Frame = memo(
  ({ frame, frameIndex, canvasTransform, readonly }: FrameProps) => {
    const dispatch = useDispatch();

    const metadata = (frame.element || frame.textNode).metadata;
    const frameBounds = metadata?.bounds;
    const [editing, setEditing] = useState(false);

    const onClick = useCallback((event: React.MouseEvent<any>) => {
      // dispatch(
      //   editorEvents.frameTitleClicked({
      //     frameIndex: frameIndex,
      //     shiftKey: event.shiftKey,
      //   })
      // );

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
