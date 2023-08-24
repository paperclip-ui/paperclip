import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";
import { patchFrame, renderFrame } from "@paperclip-ui/web-renderer";
import { useEffect, useState } from "react";
// import { useFrameUrlResolver } from "../useFrameUrlResolver";

type UseFrameStageOuterProps = {
  onUpdate: (mount: HTMLElement, data: PCModule) => void;
  variantIds: string[];
} & UseFrameStageInnerProps;

type UseFrameStageInnerProps = {
  frameIndex: number;
  showSlotPlaceholders?: boolean;
  pcData: PCModule;
  variantIds: string[];
};

export const useFrameMount = ({
  frameIndex,
  pcData,
  variantIds,
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

    if (
      state?.frameIndex === frameIndex &&
      state?.pcData === pcData &&
      state?.variantIds === variantIds
    ) {
      return;
    }

    let mount;
    if (state?.mount && frameIndex === state.frameIndex) {
      mount = state.mount;
      if (mount.isConnected) {
        // This MAY fail (try holding delete key on a bunch of frames), so blow everything away if it does and just restart.
        // Dumb approach, but simple and works for MVP. Eventually needs to be fixed.
        try {
          patchFrame(state.mount, frameIndex, state.pcData, pcData, {
            showSlotPlaceholders,
            variantIds,
            domFactory: document,
          });
        } catch (e) {
          console.error(e);
          mount = renderFrame(pcData, frameIndex, {
            showSlotPlaceholders,
            variantIds,
            domFactory: document,
          });
        }
      }
    } else {
      mount = renderFrame(pcData, frameIndex, {
        showSlotPlaceholders,
        variantIds,
        domFactory: document,
      });
    }
    onUpdate(mount, pcData);
    setState({ mount, frameIndex, pcData, variantIds });
  }, [frameIndex, pcData, variantIds, onUpdate]);

  return {
    mount: state?.mount,
  };
};
