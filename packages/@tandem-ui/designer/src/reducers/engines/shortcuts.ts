import { clamp } from "lodash";
import {
  canRemovePCNode,
  getInspectorSourceNode,
  InspectorNode,
  inspectorNodeInShadow,
  InspectorTreeNodeName,
  isVisibleNode,
  persistInspectorNodeStyle,
  persistRemovePCNode,
} from "@paperclip-lang/core";
import { Action } from "redux";
import {
  EMPTY_ARRAY,
  getNestedTreeNodeById,
  getParentTreeNode,
} from "tandem-common";
import {
  SHORTCUT_CONVERT_TO_COMPONENT_KEY_DOWN,
  SHORTCUT_C_KEY_DOWN,
  SHORTCUT_DELETE_KEY_DOWN,
  SHORTCUT_ESCAPE_KEY_DOWN,
  SHORTCUT_QUICK_SEARCH_KEY_DOWN,
  SHORTCUT_REDO_KEY_DOWN,
  SHORTCUT_R_KEY_DOWN,
  SHORTCUT_T_KEY_DOWN,
  SHORTCUT_UNDO_KEY_DOWN,
  SHORTCUT_WRAP_IN_SLOT_KEY_DOWN,
} from "../../actions";
import {
  confirm,
  ConfirmType,
  convertInspectorNodeToComponent,
  isInputSelected,
  persistRootState,
  redo,
  RootState,
  setSelectedFileNodeIds,
  setSelectedInspectorNodes,
  setTool,
  ToolType,
  undo,
  updateRootState,
  wrapInspectorNodeInSlot,
} from "../../state";

export const shortcutReducer = (
  state: RootState,
  action: Action
): RootState => {
  switch (action.type) {
    case SHORTCUT_QUICK_SEARCH_KEY_DOWN: {
      return isInputSelected()
        ? state
        : updateRootState(
            {
              showQuickSearch: !state.showQuickSearch,
            },
            state
          );
    }
    case SHORTCUT_UNDO_KEY_DOWN: {
      return undo(state);
    }
    case SHORTCUT_REDO_KEY_DOWN: {
      return redo(state);
    }
    case SHORTCUT_T_KEY_DOWN: {
      return isInputSelected() ? state : setTool(ToolType.TEXT, state);
    }
    case SHORTCUT_R_KEY_DOWN: {
      return isInputSelected() ? state : setTool(ToolType.ELEMENT, state);
    }
    case SHORTCUT_C_KEY_DOWN: {
      return isInputSelected() ? state : setTool(ToolType.COMPONENT, state);
    }

    case SHORTCUT_CONVERT_TO_COMPONENT_KEY_DOWN: {
      // TODO - should be able to conver all selected nodes to components
      if (state.selectedInspectorNodes.length > 1) {
        return state;
      }

      state = convertInspectorNodeToComponent(
        state.selectedInspectorNodes[0],
        state
      );
      return state;
    }
    case SHORTCUT_WRAP_IN_SLOT_KEY_DOWN: {
      state = wrapInspectorNodeInSlot(state.selectedInspectorNodes[0], state);
      return state;
    }
    case SHORTCUT_ESCAPE_KEY_DOWN: {
      if (isInputSelected()) {
        return state;
      }
      if (state.toolType != null) {
        return setTool(null, state);
      } else {
        state = setSelectedInspectorNodes(state);
        state = setSelectedFileNodeIds(state);
        return state;
      }
    }

    case SHORTCUT_DELETE_KEY_DOWN: {
      if (isInputSelected() || state.selectedInspectorNodes.length === 0) {
        return state;
      }

      const firstNode = state.selectedInspectorNodes[0];

      const sourceNode = getInspectorSourceNode(
        firstNode,
        state.sourceNodeInspector,
        state.graph
      );

      if (!canRemovePCNode(sourceNode, state)) {
        return confirm(
          "Please remove all instances of component before deleting it.",
          ConfirmType.ERROR,
          state
        );
      }

      let parent: InspectorNode = getParentTreeNode(
        firstNode.id,
        state.sourceNodeInspector
      );
      const index = parent.children.findIndex(
        (child) => child.id === firstNode.id
      );

      state = persistRootState((state) => {
        return state.selectedInspectorNodes.reduce((state, { id }) => {
          const inspectorNode = getNestedTreeNodeById(
            id,
            state.sourceNodeInspector
          );
          if (inspectorNodeInShadow(inspectorNode, state.sourceNodeInspector)) {
            const sourceNode = getInspectorSourceNode(
              inspectorNode,
              state.sourceNodeInspector,
              state.graph
            );

            // content, or slot. Ignore
            if (!isVisibleNode(sourceNode)) {
              return state;
            }
            return persistInspectorNodeStyle(
              { display: "none" },
              inspectorNode,
              null,
              state
            );
          }

          return persistRemovePCNode(sourceNode, state);
        }, state);
      }, state);

      parent = getNestedTreeNodeById(
        parent.id,
        state.sourceNodeInspector
      ) as InspectorNode;

      const nextChildren = parent.children.filter(
        (child) => child.sourceNodeId !== sourceNode.id
      );

      const nextSelectedNodeId = nextChildren.length
        ? nextChildren[clamp(index, 0, nextChildren.length - 1)].id
        : getParentTreeNode(parent.id, state.sourceNodeInspector).name !==
          InspectorTreeNodeName.ROOT
        ? parent.id
        : null;

      if (nextSelectedNodeId) {
        const nextInspectorNode: InspectorNode = getNestedTreeNodeById(
          nextSelectedNodeId,
          state.sourceNodeInspector
        );
        if (nextInspectorNode) {
          state = setSelectedInspectorNodes(state, [nextInspectorNode]);
        } else {
          // does not exist as rep
          state = updateRootState(
            { selectedInspectorNodes: EMPTY_ARRAY },
            state
          );
        }
      } else {
        // does not exist as rep
        state = updateRootState(
          {
            selectedInspectorNodes: EMPTY_ARRAY,
          },
          state
        );
      }
    }
  }
  return state;
};
