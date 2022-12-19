import produce from "immer";
import { DesignerState, getGraphComponents } from "../../state";
import { DesignerEngineEvent, GraphLoaded } from "./events";
import { DesignerEvent as DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";

export const apiReducer = (
  state: DesignerState,
  event: DesignerEngineEvent
) => {
  switch (event.type) {
    case "designer-engine/serverEvent":
      return serverEventReducer(state, event.payload);
    case "designer-engine/graphLoaded":
      return handleGraphLoaded(state, event);
    case "designer-engine/resourceFilePathsLoaded": {
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
      newState.screenshotUrls[event.screenshotCaptured.exprId] =
        getComponentScreenshotUrl(event.screenshotCaptured.exprId);
    });
  }
  return state;
};

const handleGraphLoaded = (state: DesignerState, event: GraphLoaded) => {
  return produce(state, (newState) => {
    for (const path in event.payload.dependencies) {
      const dep = event.payload.dependencies[path];

      newState.screenshotUrls[dep.document.id] = getComponentScreenshotUrl(
        dep.document.id
      );
    }

    for (const { component } of getGraphComponents(event.payload)) {
      newState.screenshotUrls[component.id] = getComponentScreenshotUrl(
        component.id
      );
    }
  });
};

const getComponentScreenshotUrl = (exprId: string) =>
  window.location.protocol +
  "//" +
  window.location.host +
  "/screenshots/" +
  exprId +
  ".png?" +
  Date.now();
