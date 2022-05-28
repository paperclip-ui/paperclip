import { Action } from "redux";
import * as path from "path";
import {
  FILE_NAVIGATOR_ITEM_CLICKED,
  FileNavigatorItemClicked,
  FILE_NAVIGATOR_ITEM_DOUBLE_CLICKED,
  FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED,
  FILE_NAVIGATOR_DROPPED_ITEM,
  FileNavigatorDroppedItem,
  FILE_NAVIGATOR_BASENAME_CHANGED,
  FileNavigatorBasenameChanged,
  FILE_NAVIGATOR_ITEM_BLURRED,
  FILE_NAVIGATOR_NEW_FILE_ENTERED,
  FILE_NAVIGATOR_NEW_FILE_CLICKED,
  FileNavigatorNewFileClicked,
} from "../../actions";
import {
  RootState,
  updateRootState,
  openFile,
  setSelectedFileNodeIds,
  getEditorWindowWithFileUri,
  updateEditorWindow,
  confirm,
  ConfirmType,
} from "../../state";
import {
  isDirectory,
  updateNestedNode,
  Directory,
  getParentTreeNode,
  appendChildNode,
  removeNestedTreeNode,
  FSItemTagNames,
  FSItem,
  getFileFromUri,
  sortFSItems,
  getNestedTreeNodeById,
  mergeFSItems,
  stripProtocol,
  addProtocol,
  FILE_PROTOCOL,
  updateFSItemAlts,
} from "tandem-common";

export const fileNavigatorReducer = (
  state: RootState,
  action: Action
): RootState => {
  switch (action.type) {
    case FILE_NAVIGATOR_ITEM_CLICKED: {
      const { node } = action as FileNavigatorItemClicked;
      const uri = node.uri;
      state = setSelectedFileNodeIds(state, node.id);
      state = setFileExpanded(node, true, state);

      if (!isDirectory(node)) {
        state = openFile(uri, true, false, state);
        return state;
      }

      return state;
    }

    case FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED: {
      const { node } = action as FileNavigatorItemClicked;
      state = setFileExpanded(node, !node.expanded, state);
      return state;
    }

    case FILE_NAVIGATOR_BASENAME_CHANGED: {
      const { item, basename }: FileNavigatorBasenameChanged =
        action as FileNavigatorBasenameChanged;

      const updatedItem = {
        ...item,
        uri: addProtocol(
          FILE_PROTOCOL,
          path.join(path.dirname(stripProtocol(item.uri)), basename)
        ),
      };

      state = { ...state, editingBasenameUri: null };

      const existingItem = getFileFromUri(
        updatedItem.uri,
        state.projectDirectory
      );

      // directory expanded so we can safely dispatch alert here
      if (existingItem) {
        return confirm(
          `The name "${basename}" is already taken. Please choose a different name.`,
          ConfirmType.ERROR,
          state
        );
      }

      let projectDirectory = removeNestedTreeNode(item, state.projectDirectory);
      projectDirectory = mergeFSItems(updatedItem, projectDirectory);
      state = updateRootState({ projectDirectory }, state);

      // TODO - this also needs to work with directories
      const editorWindow = getEditorWindowWithFileUri(item.uri, state);
      if (editorWindow) {
        let graph = { ...state.graph };
        let fileCache = { ...state.fileCache };
        graph[updatedItem.uri] = graph[item.uri];
        fileCache[updatedItem.uri] = fileCache[item.uri];
        delete graph[item.uri];
        delete fileCache[item.uri];
        state = updateEditorWindow(
          {
            tabUris: editorWindow.tabUris.map((uri) => {
              return item.uri === uri ? updatedItem.uri : uri;
            }),
            activeFilePath:
              editorWindow.activeFilePath === item.uri
                ? updatedItem.uri
                : editorWindow.activeFilePath,
          },
          item.uri,
          state
        );
        state = updateRootState(
          {
            graph,
            fileCache,
            activeEditorFilePath:
              state.activeEditorFilePath === item.uri
                ? updatedItem.uri
                : state.activeEditorFilePath,
            openFiles: state.openFiles.map((openFile) => ({
              ...openFile,
              uri: openFile.uri === item.uri ? updatedItem.uri : openFile.uri,
            })),
          },
          state
        );
      }

      return state;
    }

    case FILE_NAVIGATOR_NEW_FILE_CLICKED: {
      const { fileType } = action as FileNavigatorNewFileClicked;
      const selectedFileNode: FSItem = getNestedTreeNodeById(
        state.selectedFileNodeIds[0],
        state.projectDirectory
      );

      const activeFileNode: FSItem =
        state.activeEditorFilePath &&
        getFileFromUri(state.activeEditorFilePath, state.projectDirectory);

      const targetFileNode = selectedFileNode || activeFileNode;

      const dirFile = targetFileNode
        ? targetFileNode.name === FSItemTagNames.DIRECTORY
          ? targetFileNode
          : getParentTreeNode(targetFileNode.id, state.projectDirectory)
        : state.projectDirectory;
      state = {
        ...state,
        addNewFileInfo: {
          fileType,
          directory: dirFile,
        },
      };
      return state;
    }

    case FILE_NAVIGATOR_NEW_FILE_ENTERED: {
      state = { ...state, addNewFileInfo: null };
      return state;
    }

    case FILE_NAVIGATOR_ITEM_DOUBLE_CLICKED: {
      const {
        node: { uri },
      } = action as FileNavigatorItemClicked;
      state = {
        ...state,
        editingBasenameUri: uri,
      };
      return state;
    }

    case FILE_NAVIGATOR_ITEM_BLURRED: {
      state = {
        ...state,
        editingBasenameUri: null,
      };
      return state;
    }

    case FILE_NAVIGATOR_DROPPED_ITEM: {
      const { node, targetNode } = action as FileNavigatorDroppedItem;
      const parent: Directory = getParentTreeNode(
        node.id,
        state.projectDirectory
      );
      const parentUri = parent.uri;
      const nodeUri = node.uri;
      state = updateRootState(
        {
          projectDirectory: updateNestedNode(
            parent,
            state.projectDirectory,
            (parent) => removeNestedTreeNode(node, parent)
          ),
        },
        state
      );

      const targetDir: Directory =
        targetNode.name !== FSItemTagNames.FILE
          ? targetNode
          : getParentTreeNode(targetNode.id, state.projectDirectory);
      const targetUri = targetDir.uri;

      state = updateRootState(
        {
          projectDirectory: updateNestedNode(
            targetDir,
            state.projectDirectory,
            (targetNode) => {
              targetNode = appendChildNode(
                {
                  ...node,
                  uri: nodeUri.replace(parentUri, targetUri),
                } as FSItem,
                targetNode
              );

              targetNode = {
                ...targetNode,
                children: sortFSItems(targetNode.children as FSItem[]),
              };

              return targetNode;
            }
          ),
        },
        state
      );

      return state;
    }
  }

  return state;
};

const setFileExpanded = (node: FSItem, value: boolean, state: RootState) => {
  state = updateRootState(
    {
      projectDirectory: updateFSItemAlts(
        updateNestedNode(node, state.projectDirectory, (node: FSItem) => ({
          ...node,
          expanded: value,
        }))
      ),
    },
    state
  );
  return state;
};
