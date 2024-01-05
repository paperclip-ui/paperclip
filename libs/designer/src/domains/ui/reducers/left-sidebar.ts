import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  DesignerState,
  FSItemKind,
  NewFileKind,
  expandDirs,
  getActiveRelativeDirectory,
  getCurrentFilePath,
  getTargetExprId,
  newDesignFilePrompt,
  newDirectoryPrompt,
  redirect,
  renameFilePrompt,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import produce from "immer";
import { expandVirtIds, selectNode } from "../state";
import { uniq } from "lodash";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { ShortcutCommand } from "../../shortcuts/state";
import { newDeleteFileConfirmation } from "@paperclip-ui/designer/src/state/confirm";

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
          Object.assign(
            newState,
            expandVirtIds([event.payload.virtId], newState)
          );
        });
      }

      return state;
    }
    case "designer-engine/documentOpened": {
      state = expandLayerVirtIds(state);
      state = produce(state, (newState) => {
        newState.selectedFilePath = getCurrentFilePath(state);
      });
      return state;
    }
    case "designer-engine/fileCreated": {
      return produce(state, (newState) => {
        newState.selectedFilePath = event.payload.filePath;
      });
    }
    case "history-engine/historyChanged": {
      state = expandLayerVirtIds(state);

      return produce(state, (draft) => {
        draft.fileFilter = null;
        draft.selectedFilePath = getCurrentFilePath(state);
        expandDirs(state.projectDirectory.path)(draft);
      });
    }
    case "ui/AddFileItemClicked": {
      return produce(state, (newState) => {
        if (event.payload === NewFileKind.DesignFile) {
          newState.prompt = newDesignFilePrompt(
            getActiveRelativeDirectory(state)
          );
        } else if (event.payload === NewFileKind.Directory) {
          newState.prompt = newDirectoryPrompt(
            getActiveRelativeDirectory(state)
          );
        }
      });
    }

    case "shortcuts/itemSelected": {
      return produce(state, (newState) => {
        if (event.payload.command === ShortcutCommand.RenameFile) {
          newState.prompt = renameFilePrompt(newState.selectedFilePath);
        } else if (event.payload.command === ShortcutCommand.DeleteFile) {
          newState.confirm = newDeleteFileConfirmation(
            newState.selectedFilePath
          );
        }
      });
    }
    case "ui/FileNavigatorContextMenuOpened":
    case "ui/FileNavigatorItemClicked": {
      if (event.payload.kind === FSItemKind.File) {
        state = redirect(
          state,
          routes.editor({ filePath: event.payload.path })
        );
      } else {
        state = produce(state, (newState) => {
          newState.selectedFilePath = event.payload.path;
        });
        // gets done on redirect so we're good!
        state = produce(state, expandDirs(event.payload.path));
      }

      return state;
    }
    case "ui/fileFilterChanged": {
      return produce(state, (newState) => {
        newState.fileFilter = event.payload;
        newState.focusOnFileSearch = false;
      });
    }
    case "ui/layerLeafClicked": {
      state = selectNode(event.payload.virtId, state);
      return state;
    }
  }
  return state;
};

const expandLayerVirtIds = (state: DesignerState) => {
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

  return state;
};
