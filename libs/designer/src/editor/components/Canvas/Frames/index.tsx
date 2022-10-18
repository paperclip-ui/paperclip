import React, { useCallback } from "react";
import { getFrameRects } from "@paperclip-ui/web-renderer";
import { memo } from "react";
import { Frame } from "./Frame";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getCurrentDocument } from "../../../machine/state";
import { PCModule } from "@paperclip-ui/proto/lib/virt/module_pb";
import { editorEvents } from "../../../machine/events";

type FramesProps = {
  expandedFrameIndex?: number;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const doc = useSelector(getCurrentDocument);

  const { frames, onFrameLoaded, onFrameUpdated } = useFrames({
    shouldCollectRects: true,
  });

  return (
    <>
      {frames.map((frame, i) => {
        return (
          <Frame
            key={i}
            pcData={doc.paperclip}
            onLoad={onFrameLoaded}
            onUpdate={onFrameUpdated}
            expanded={expandedFrameIndex === i}
            frameIndex={i}
            preview={frame}
          />
        );
      })}
    </>
  );
});

type UseFramesProps = {
  shouldCollectRects: boolean;
};

const useFrames = ({ shouldCollectRects = true }: UseFramesProps) => {
  const doc = useSelector(getCurrentDocument);
  const dispatch = useDispatch();

  const emitFrameRects = useCallback(
    (mount: HTMLElement, data: PCModule.AsObject, frameIndex: number) => {
      if (!shouldCollectRects) {
        return false;
      }

      const rects = getFrameRects(mount, data, frameIndex);
      console.log(rects);

      dispatch(editorEvents.rectsCaptured({ frameIndex, rects }));
    },
    [dispatch, shouldCollectRects]
  );

  const onFrameUpdated = (
    mount: HTMLElement,
    data: PCModule.AsObject,
    index: number
  ) => {
    emitFrameRects(mount, data, index);
  };

  const onFrameLoaded = (
    mount: HTMLElement,
    data: PCModule.AsObject,
    index: number
  ) => {
    emitFrameRects(mount, data, index);
  };

  if (!doc?.paperclip) {
    return { frames: [], onFrameLoaded };
  }

  const frames = doc.paperclip.html.childrenList;

  return { frames, onFrameLoaded, onFrameUpdated };
};
