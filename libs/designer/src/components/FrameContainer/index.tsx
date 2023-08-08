import React from "react";
import { memo } from "react";
import { noop } from "lodash";
import { useFrame } from "../../hooks/useFrame";
import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";

type FrameContainerProps = {
  style?: any;
  extraHTML?: string;
  document: PCModule;
  frameIndex: number;
  variantIds: string[];
  fullscreen: boolean;
  onLoad?: (mount: HTMLElement) => void;
  onUpdate?: (mount: HTMLElement) => void;
};

export const FrameContainer = memo(
  ({
    frameIndex,
    style = {},
    document,
    extraHTML,
    variantIds,
    fullscreen,
    onLoad = noop,
    onUpdate = noop,
  }: FrameContainerProps) => {
    const { ref } = useFrame({
      fullscreen,
      extraHTML,
      variantIds,
      onUpdate,
      pcData: document,
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
