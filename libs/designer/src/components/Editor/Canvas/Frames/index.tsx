import React, { useCallback } from "react";
import { computeAllStyles, getFrameRects } from "@paperclip-ui/web-renderer";
import { memo } from "react";
import { Frame } from "./Frame";
import { throttle } from "lodash";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getCurrentDocument,
  getEditorState,
  StyleOverrides,
} from "@paperclip-ui/designer/src/state";
import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";
import { designerEvents } from "@paperclip-ui/designer/src/events";

type FramesProps = {
  expandedFrameIndex?: number | null;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const { currentDocument: doc, styleOverrides } = useSelector(getEditorState);

  const extraHTML = generateStyleOverrideHTML(styleOverrides);

  const { frames, onFrameLoaded, onFrameUpdated } = useFrames({
    shouldCollectRects: true,
  });

  return (
    <>
      {frames.map((frame, i) => {
        return (
          <Frame
            key={i}
            document={doc!.paperclip!}
            onLoad={onFrameLoaded}
            onUpdate={onFrameUpdated}
            extraHTML={extraHTML}
            expanded={expandedFrameIndex === i}
            frameIndex={i}
            preview={frame}
          />
        );
      })}
    </>
  );
});

const generateStyleOverrideHTML = (styleOverrides: StyleOverrides) => {
  if (!styleOverrides) {
    return "";
  }

  let html = "";

  html += "<style>\n";

  for (const id in styleOverrides) {
    const decls = styleOverrides[id];

    html += `  #_${id} {\n`;

    for (const key in decls) {
      html += `    ${key}: ${castDeclValue(decls[key])} !important;\n`;
    }
    html += "  }\n\n";
  }

  html += "</style>";

  return html;
};

const castDeclValue = (value: string | number) =>
  typeof value === "number" ? value + "px" : value;

type UseFramesProps = {
  shouldCollectRects: boolean;
};

const useFrames = ({ shouldCollectRects = true }: UseFramesProps) => {
  const doc = useSelector(getCurrentDocument);
  const dispatch = useDispatch();

  const emitFrameRects = useCallback(
    (mount: HTMLElement, data: PCModule, frameIndex: number) => {
      if (!shouldCollectRects) {
        return false;
      }

      const rects = getFrameRects(mount, data, frameIndex);
      const computedStyles = computeAllStyles(mount, frameIndex);
      dispatch({
        type: "editor/rectsCaptured",
        payload: { frameIndex, rects },
      });
      dispatch({
        type: "editor/computedStylesCaptured",
        payload: computedStyles,
      });
    },
    [dispatch, shouldCollectRects]
  );

  const onFrameUpdated = (
    mount: HTMLElement,
    data: PCModule,
    index: number
  ) => {
    emitFrameRects(mount, data, index);
  };

  const onFrameLoaded = useCallback(
    (mount: HTMLElement, data: PCModule, index: number) => {
      emitFrameRects(mount, data, index);
    },
    [emitFrameRects]
  );

  if (!doc?.paperclip) {
    return { frames: [], onFrameLoaded };
  }

  const frames = doc.paperclip?.html?.children || [];

  return { frames, onFrameLoaded, onFrameUpdated };
};
