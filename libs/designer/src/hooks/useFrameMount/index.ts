import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";
import { patchFrame, renderFrame } from "@paperclip-ui/web-renderer";
import { useEffect, useState } from "react";
// import { useFrameUrlResolver } from "../useFrameUrlResolver";

type UseFrameStageOuterProps = {
  onUpdate: (mount: HTMLElement, data: PCModule) => void;
} & UseFrameStageInnerProps;

type UseFrameStageInnerProps = {
  frameIndex: number;
  showSlotPlaceholders?: boolean;
  pcData: PCModule;
};

export const useFrameMount = ({
  frameIndex,
  pcData,
  showSlotPlaceholders,
  onUpdate,
}: UseFrameStageOuterProps) => {
  const [state, setState] = useState<
    UseFrameStageInnerProps & {
      pcData: PCModule;
      mount: HTMLElement;
    }
  >();

  // const resolveUrl = useFrameUrlResolver();

  useEffect(() => {
    // this will happen if onUpdate changes
    if (!pcData) {
      return;
    }

    if (state?.frameIndex === frameIndex && state?.pcData === pcData) {
      return;
    }

    let mount;
    if (state?.mount && frameIndex === state.frameIndex) {
      mount = state.mount;
      patchFrame(state.mount, frameIndex, state.pcData, pcData, {
        showSlotPlaceholders,
        domFactory: document,
      });
    } else {
      mount = renderFrame(pcData, frameIndex, {
        showSlotPlaceholders,
        domFactory: document,
      });
    }
    onUpdate(mount, pcData);
    setState({ mount, frameIndex, pcData });
  }, [frameIndex, pcData, onUpdate]);

  return {
    mount: state?.mount,
  };
};
