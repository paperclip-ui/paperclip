import React, { useRef } from "react";
import { memo } from "react";
import { noop } from "lodash";
import { useFrame } from "../../hooks/useFrame";
import { PCModule } from "@paperclip-ui/proto/lib/virt/module_pb";

type FramesProps = {
  expandedFrameIndex?: number;
};

type FrameContainerProps = {
  style?: any;
  pcData: PCModule.AsObject;
  frameIndex: number;
  fullscreen: boolean;
  onLoad?: (mount: HTMLElement) => void;
  onUpdate?: (mount: HTMLElement) => void;
};

export const FrameContainer = memo(
  ({
    frameIndex,
    style = {},
    pcData,
    fullscreen,
    onLoad = noop,
    onUpdate = noop,
  }: FrameContainerProps) => {
    const { ref } = useFrame({
      fullscreen,
      onUpdate,
      pcData,
      onLoad,
      frameIndex,
      showSlotPlaceholders: false,
    });

    return (
      <div style={{ width: "100%", height: "100%", ...style }} ref={ref} />
    );
  }
);

export type UseFrameContainerProps = {
  content: HTMLElement;
  onLoad?: () => void;
  fullscreen?: boolean;
};
