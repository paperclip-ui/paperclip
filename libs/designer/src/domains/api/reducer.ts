import produce from "immer";
import {
  DesignerState,
  getAllComponents,
  getGraphComponents,
} from "../../state";
import { DesignerEngineEvent, designerEngineEvents } from "./events";
import { DesignerEvent as DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";

export const apiReducer = (
  state: DesignerState,
  event: DesignerEngineEvent
) => {
  switch (event.type) {
    case designerEngineEvents.serverEvent.type:
      return serverEventReducer(state, event.payload);
    case designerEngineEvents.graphLoaded.type:
      return handleGraphLoaded(state, event);
    case designerEngineEvents.resourceFilePathsLoaded.type: {
      return produce(state, (newState) => {
        newState.resourceFilePaths = event.payload;
      });
    }
  }
  return state;
};

const serverEventReducer = (state: DesignerState, event: DesignServerEvent) => {
  if (event.screenshotCaptured) {
    return produce(state, (newState) => {
      newState.screenshotUrls[event.screenshotCaptured.componentId] =
        getComponentScreenshotUrl(event.screenshotCaptured.componentId);
    });
  }
  return state;
};

const handleGraphLoaded = (
  state: DesignerState,
  event: ReturnType<typeof designerEngineEvents.graphLoaded>
) => {
  return produce(state, (newState) => {
    for (const { component } of getGraphComponents(event.payload)) {
      newState.screenshotUrls[component.id] = getComponentScreenshotUrl(
        component.id
      );
    }
  });
};

const getComponentScreenshotUrl = (componentId: string) =>
  window.location.protocol +
  "//" +
  window.location.host +
  "/screenshots/" +
  componentId +
  ".png?" +
  Date.now();
