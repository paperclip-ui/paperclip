import {
  createPCElement,
  getInspectorSourceNode,
  getInspectorSyntheticNode,
  getSyntheticDocumentDependencyUri,
  getSyntheticVisibleNodeDocument,
  PCVisibleNode,
  persistRemoveInspectorNode,
  persistReplacePCNode,
} from "paperclip";
import { Action } from "redux";
import { Directory, getParentTreeNode } from "tandem-common";
import {
  EDITOR_TAB_CONTEXT_MENU_OPEN_IN_BOTTOM_OPTION_CLICKED,
  FileItemContextMenuAction,
  FILE_ITEM_CONTEXT_MENU_CREATE_BLANK_FILE_CLICKED,
  FILE_ITEM_CONTEXT_MENU_CREATE_COMPONENT_FILE_CLICKED,
  FILE_ITEM_CONTEXT_MENU_CREATE_DIRECTORY_CLICKED,
  FILE_ITEM_CONTEXT_MENU_RENAME_CLICKED,
  InspectorNodeContextMenuAction,
  INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TEXT_STYLES_TO_MIXIN_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_COMPONENT_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_STYLE_MIXIN_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_REMOVE_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_RENAME_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_SELECT_PARENT_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_SELECT_SOURCE_NODE_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_SHOW_IN_CANVAS_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_ELEMENT_CLICKED,
  INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_SLOT_CLICKED,
  ModuleContextMenuOptionClicked,
  MODULE_CONTEXT_MENU_CLOSE_OPTION_CLICKED,
} from "../../actions";
import {
  AddFileType,
  centerEditorCanvasOrLater,
  closeFile,
  convertInspectorNodeStyleToMixin,
  convertInspectorNodeToComponent,
  openFile,
  openSyntheticVisibleNodeOriginFile,
  persistRootState,
  RootState,
  selectInspectorNode,
  setSelectedInspectorNodes,
  wrapInspectorNodeInSlot,
} from "../../state";

export const contextMenuActionReducer = (state: RootState, action: Action) => {
  switch (action.type) {
    case INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_SLOT_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;
      state = wrapInspectorNodeInSlot(item, state);
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_COMPONENT_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;
      state = convertInspectorNodeToComponent(item, state);
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_ELEMENT_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;
      state = persistRootState((state) => {
        const sourceNode = getInspectorSourceNode(
          item,
          state.sourceNodeInspector,
          state.graph
        ) as PCVisibleNode;
        state = persistReplacePCNode(
          createPCElement("div", null, null, [sourceNode], "Element"),
          sourceNode,
          state
        );

        return state;
      }, state);
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_STYLE_MIXIN_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;
      state = convertInspectorNodeStyleToMixin(item, state);
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TEXT_STYLES_TO_MIXIN_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;
      state = convertInspectorNodeStyleToMixin(item, state, true);
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_SELECT_PARENT_CLICKED: {
      const { item: inspectorNode } = action as InspectorNodeContextMenuAction;
      const parent = getParentTreeNode(
        inspectorNode.id,
        state.sourceNodeInspector
      );
      state = parent ? selectInspectorNode(parent, state) : state;
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_SELECT_SOURCE_NODE_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;

      state = openSyntheticVisibleNodeOriginFile(
        getInspectorSyntheticNode(item, state.documents),
        state
      );
      return state;
    }

    case FILE_ITEM_CONTEXT_MENU_CREATE_COMPONENT_FILE_CLICKED:
    case FILE_ITEM_CONTEXT_MENU_CREATE_DIRECTORY_CLICKED:
    case FILE_ITEM_CONTEXT_MENU_CREATE_BLANK_FILE_CLICKED: {
      const map = {
        [FILE_ITEM_CONTEXT_MENU_CREATE_BLANK_FILE_CLICKED]: AddFileType.BLANK,
        [FILE_ITEM_CONTEXT_MENU_CREATE_DIRECTORY_CLICKED]:
          AddFileType.DIRECTORY,
        [FILE_ITEM_CONTEXT_MENU_CREATE_COMPONENT_FILE_CLICKED]:
          AddFileType.COMPONENT,
      };
      const { item } = action as FileItemContextMenuAction;
      state = {
        ...state,
        addNewFileInfo: {
          directory: item as Directory,
          fileType: map[action.type],
        },
      };
      return state;
    }

    case FILE_ITEM_CONTEXT_MENU_RENAME_CLICKED: {
      const {
        item: { uri },
      } = action as FileItemContextMenuAction;
      state = {
        ...state,
        editingBasenameUri: uri,
      };
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_REMOVE_CLICKED: {
      const { item: inspectorNode } = action as InspectorNodeContextMenuAction;
      state = persistRootState((state) => {
        return persistRemoveInspectorNode(inspectorNode, state);
      }, state);
      state = setSelectedInspectorNodes(state);
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_RENAME_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;
      state = {
        ...state,
        renameInspectorNodeId: item.id,
      };
      return state;
    }

    case INSPECTOR_NODE_CONTEXT_MENU_SHOW_IN_CANVAS_CLICKED: {
      const { item } = action as InspectorNodeContextMenuAction;

      if (!item) {
        return state;
      }
      const syntheticNode = getInspectorSyntheticNode(item, state.documents);

      const uri = getSyntheticDocumentDependencyUri(
        getSyntheticVisibleNodeDocument(syntheticNode.id, state.documents),
        state.graph
      );
      state = centerEditorCanvasOrLater(state, uri);
      return state;
    }

    case MODULE_CONTEXT_MENU_CLOSE_OPTION_CLICKED: {
      const { uri } = action as ModuleContextMenuOptionClicked;
      return closeFile(uri, state);
    }
    case EDITOR_TAB_CONTEXT_MENU_OPEN_IN_BOTTOM_OPTION_CLICKED: {
      const { uri } = action as ModuleContextMenuOptionClicked;
      state = openFile(uri, false, true, state);
      return state;
    }
  }
  return state;
};
