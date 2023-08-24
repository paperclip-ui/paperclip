import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  DesignerState,
  getTargetExprId,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import produce from "immer";
import { expandVirtIds, selectNode } from "../state";
import { uniq } from "lodash";

export const leftSidebarReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "ui/layerArrowClicked": {
      if (state.expandedLayerVirtIds.includes(event.payload.virtId)) {
        const flattened = ast.flattenExpressionInfo(
          ast.getExprInfoById(event.payload.virtId, state.graph)
        );
        state = produce(state, (newState) => {
          newState.expandedLayerVirtIds = newState.expandedLayerVirtIds.filter(
            (id) => flattened[id] == null && !event.payload.virtId.includes(id)
          );
        });
      } else {
        state = produce(state, (newState) => {
          Object.assign(expandVirtIds([event.payload.virtId], newState));
        });
      }

      return state;
    }
    case "designer-engine/graphLoaded":
    case "designer-engine/documentOpened":
    case "history-engine/historyChanged": {
      const targetId = getTargetExprId(state);

      if (targetId) {
        state = produce(state, (newState) => {
          newState.expandedLayerVirtIds = uniq([
            targetId,
            ...state.expandedLayerVirtIds,
            ...ast.getAncestorIds(targetId, state.graph),
          ]);
        });
      }

      state = produce(state, (newState) => {
        newState.fileFilter = null;
      });
      return state;
    }
    case "ui/fileFilterChanged": {
      return produce(state, (newState) => {
        newState.fileFilter = event.payload;
      });
    }
    case "ui/layerLeafClicked": {
      state = selectNode(event.payload.virtId, false, false, state);
      return state;
    }
  }
  return state;
};
