import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as styles from "./index.pc";
import * as qs from "querystring";
import { Node, NodeMedata } from "@paperclip-ui/proto/lib/virt/html_pb";
import { Transform } from "@paperclip-ui/designer/src/editor/machine/state/geom";

export type FramesProps = {
  frames: Node.AsObject[];
  canvasTransform: Transform;
  readonly: boolean;
};

export const Frames = memo(
  ({ frames, canvasTransform, ui, readonly }: FramesProps) => {
    return (
      <>
        {frames.map((frame, i) => {
          return (
            <Frame
              key={i}
              frameIndex={i}
              ui={ui}
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
    const metadata: NodeMedata =
      (frame.annotations && computeVirtScriptObject(frame.annotations)) || {};
    if (annotations.frame?.visible === false) {
      return null;
    }
    const frameBounds = getFrameBounds(frame as any);
    const [editing, setEditing] = useState(false);

    const onClick = useCallback(
      (event: React.MouseEvent<any>) => {
        dispatch(
          frameTitleClicked({
            frameIndex: frameIndex,
            shiftKey: event.shiftKey,
          })
        );

        // prevent canvas click event
        event.stopPropagation();
      },
      [dispatch]
    );
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
      dispatch(
        frameTitleChanged({ frameIndex, value: inputRef.current.value })
      );
    }, [editing, inputRef, frameIndex, setEditing]);
    const onBlur = onChanged;
    useEffect(() => {
      inputRef.current.value = annotations.frame?.title || "";
    }, [inputRef, annotations.frame?.title]);

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
          value={annotations.frame?.title || "Untitled"}
        />
      </styles.Frame>
    );
  }
);
