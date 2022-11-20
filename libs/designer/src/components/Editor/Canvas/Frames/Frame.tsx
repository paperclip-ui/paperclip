import React, { useCallback } from "react";
import { memo, useMemo } from "react";
import * as styles from "./styles.pc";
import { FrameContainer } from "@paperclip-ui/designer/src/components/FrameContainer";
import { Node as VirtNode } from "@paperclip-ui/proto/lib/generated/virt/html";
import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";

const DEFAULT_BOUNDS = { x: 0, y: 0, width: 1024, height: 768 };

type FrameProps = {
  frameIndex: number;
  expanded: boolean;
  preview: VirtNode;
  document: PCModule;
  extraHTML?: string;
  onLoad: (mount: HTMLElement, data: PCModule, frameIndex: number) => void;
  onUpdate: (mount: HTMLElement, data: PCModule, frameIndex: number) => void;
};

export const Frame = memo(
  ({
    frameIndex,
    preview,
    expanded,
    extraHTML,
    document,
    onLoad,
    onUpdate,
  }: FrameProps) => {
    if (!preview) {
      return null;
    }

    const onLoad2 = useCallback(
      (mount: HTMLElement) => {
        onLoad(mount, document, frameIndex);
      },
      [frameIndex, document, onLoad]
    );

    const onUpdate2 = useCallback(
      (mount: HTMLElement) => {
        onUpdate(mount, document, frameIndex);
      },
      [frameIndex, document, onUpdate]
    );

    const frameStyle = useMemo(() => {
      const bounds = getFrameBounds(preview) || DEFAULT_BOUNDS;

      if (expanded) {
        return {
          width: `100%`,
          height: `100%`,

          // necessary since client rects include frame position
          left: bounds.x,
          top: bounds.y,
          zIndex: 1,
          position: "absolute",
        };
      }

      return {
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        top: bounds.y,
        position: "absolute",
      };
    }, [
      preview.element?.metadata || preview.textNode?.metadata,
      expanded,
    ]) as any;

    return (
      <styles.Frame style={frameStyle}>
        <FrameContainer
          extraHTML={extraHTML}
          frameIndex={frameIndex}
          document={document}
          fullscreen={expanded}
          onLoad={onLoad2}
          onUpdate={onUpdate2}
        />
      </styles.Frame>
    );
  }
);

const getFrameBounds = (node: VirtNode) => {
  return node.element?.metadata?.bounds || node.textNode?.metadata?.bounds;
};
