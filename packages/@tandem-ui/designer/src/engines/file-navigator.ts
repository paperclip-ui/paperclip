import {
  createPCElement,
  createPCModule,
  PCVisibleNodeMetadataKey,
} from "@paperclip-lang/core";
import * as path from "path";
import { Dispatch } from "react";
import { Action } from "redux";
import {
  addProtocol,
  createBounds,
  Directory,
  EMPTY_ARRAY,
  FILE_PROTOCOL,
  FSItem,
  FSItemTagNames,
  getNestedTreeNodeById,
  stripProtocol,
} from "tandem-common";
import {
  FileItemContextMenuAction,
  FileNavigatorBasenameChanged,
  FileNavigatorNewFileEntered,
  fileRemoved,
  FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED,
  FILE_NAVIGATOR_BASENAME_CHANGED,
  FILE_NAVIGATOR_NEW_FILE_ENTERED,
  newFileAdded,
} from "../actions";
import { RootState } from "../state";

export type FileNavigatorEngineOptions = {
  createDirectory(url: string): void;
  writeFile(url: string, content: Buffer): any;
  renameFile(url: string, newBaseName: string): any;
  deleteFile(url: string): void;
};

export const fileNavigatorEngine =
  ({
    createDirectory,
    deleteFile,
    writeFile,
    renameFile,
  }: FileNavigatorEngineOptions) =>
  (dispatch: Dispatch<Action>) => {
    const handleWriteFile = async (
      action: Action,
      { projectDirectory }: RootState
    ) => {
      if (action.type !== FILE_NAVIGATOR_NEW_FILE_ENTERED) {
        return;
      }
      const { basename, directoryId, insertType } =
        action as FileNavigatorNewFileEntered;

      const directory: Directory = getNestedTreeNodeById(
        directoryId,
        projectDirectory
      );
      const uri = directory.uri;
      const filePath = path.join(stripProtocol(uri), basename);
      const fileUri = addProtocol(FILE_PROTOCOL, filePath);

      if (insertType === FSItemTagNames.FILE) {
        await writeFile(
          fileUri,
          Buffer.from(generateBlankFileContent(basename))
        );
      } else {
        await createDirectory(fileUri);
      }

      dispatch(newFileAdded(fileUri, insertType));
    };

    const handleDeleteFile = async (action: Action, state: RootState) => {
      if (action.type !== FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED) {
        return;
      }
      if (!confirm(`Are you sure you want to delete this file?`)) {
        return;
      }

      const { item } = action as FileItemContextMenuAction;

      await deleteFile(item.uri);
      dispatch(fileRemoved(item));
    };

    const handleBaseNameChanged = async (action: Action) => {
      if (action.type !== FILE_NAVIGATOR_BASENAME_CHANGED) {
        return;
      }
      const { item, basename } = action as FileNavigatorBasenameChanged;
      await renameFile(item.uri, basename);
    };

    return (action: Action, state: RootState) => {
      handleWriteFile(action, state);
      handleDeleteFile(action, state);
      handleBaseNameChanged(action);
    };
  };

const generateBlankFileContent = (basename: string) => {
  if (/\.pc$/.test(basename)) {
    return JSON.stringify(
      createPCModule([
        createPCElement("div", {}, {}, EMPTY_ARRAY, "Frame", {
          [PCVisibleNodeMetadataKey.BOUNDS]: createBounds(0, 600, 0, 400),
        }),
      ]),
      null,
      2
    );
  }
  return "";
};
