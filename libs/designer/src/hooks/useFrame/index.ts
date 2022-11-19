import { noop } from "lodash";
import { useCallback, useState } from "react";
import { useFrameContainer } from "../useFrameContainer";
import { useFrameMount } from "../useFrameMount";
import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";

export type UseFrameProps = {
  frameIndex: number;
  pcData: PCModule;
  style?: Record<string, any>;
  onLoad?: (mount: HTMLElement, data: PCModule) => void;
  onUpdate?: (mount: HTMLElement, data: PCModule) => void;
  fullscreen?: boolean;
  showSlotPlaceholders?: boolean;
  extraHTML?: string;
};

export const useFrame = ({
  onLoad = noop,
  onUpdate = noop,
  fullscreen,
  pcData,
  extraHTML,
  frameIndex,
  showSlotPlaceholders,
}: UseFrameProps) => {
  const [loaded, setLoaded] = useState(false);

  // update may be triggered before the frame mount is appended to the document body,
  // so we need to prohibit updates from being emitted _until_ the container iframe is ready
  const onUpdate2 = useCallback(
    (mount: HTMLElement, data: PCModule) => {
      if (!loaded) {
        return;
      }
      onUpdate(mount, data);
    },
    [frameIndex, onUpdate]
  );

  const { mount } = useFrameMount({
    pcData,
    showSlotPlaceholders,
    frameIndex,
    onUpdate: onUpdate2,
  });

  // once the container loads, _then_ we can fire subsequent updates
  const onLoad2 = useCallback(() => {
    onLoad(mount, pcData);
    setLoaded(true);
  }, [mount, pcData]);

  return useFrameContainer({ mount, onLoad: onLoad2, fullscreen, extraHTML });
};
