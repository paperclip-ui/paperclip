import produce from "immer";
import {
  DesignerState,
  findVirtId,
  findVirtNode,
  getGraphComponents,
} from "../../state";
import { DesignerEngineEvent, GraphLoaded } from "./events";
import { DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import jasonpatch from "fast-json-patch";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";

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
    case "designer-engine/documentOpened":
      state = produce(state, (newState) => {
        newState.currentDocument = event.payload;
        for (const id of newState.insertedNodeIds) {
          const expr = ast.getExprInfoById(id, newState.graph);
          if (!expr) {
            continue;
          }
          if (expr.kind === ast.ExprKind.Variant) {
            newState.activeVariantId = expr.expr.id;
          } else if (
            expr.kind === ast.ExprKind.TextNode ||
            expr.kind === ast.ExprKind.Element ||
            expr.kind === ast.ExprKind.Component ||
            expr.kind === ast.ExprKind.Slot
          ) {
            newState.selectedTargetId = expr.expr.id;
          }
        }
        newState.insertedNodeIds = [];
      });
      return state;

    case "designer-engine/changesApplied": {
      return produce(state, (newState) => {
        newState.insertedNodeIds.push(
          ...event.payload.changes
            .map((change) => {
              return change.expressionInserted?.id;
            })
            .filter(Boolean)
        );
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
  state = syncGraphScreenshots(state, event.payload);
  state = setGraph(state, event.payload);
  return state;
};

const setGraph = (state: DesignerState, graph: Graph) => {
  const next = {
    ...state.graph,
    dependencies: {
      ...state.graph.dependencies,
      ...graph.dependencies,
    },
  };

  const diff = jasonpatch.compare(state.graph.dependencies, next.dependencies);
  return produce(state, (newState) => {
    jasonpatch.applyPatch(newState.graph.dependencies, diff);
  });
};

const syncGraphScreenshots = (state: DesignerState, graph: Graph) => {
  return produce(state, (newState) => {
    for (const path in graph.dependencies) {
      const dep = graph.dependencies[path];

      newState.screenshotUrls[dep.document.id] = getComponentScreenshotUrl(
        dep.document.id
      );
    }

    for (const { component } of getGraphComponents(graph)) {
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
