import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DesignerState } from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import produce from "immer";
import { expandVirtIds, selectNode } from "../state";

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

    case "ui/layerLeafClicked": {
      state = selectNode(event.payload.virtId, false, false, state);
      return state;
    }
  }
  return state;
};
