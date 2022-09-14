import React, { useState } from "react";
import {
  BaseFileNavigatorProps,
  FileNavigatorLayer,
  NewFileInput,
} from "./view.pc";
import {
  Directory,
  memoize,
  FSItemTagNames,
  FSItem,
  EMPTY_ARRAY,
} from "tandem-common";
import { Dispatch } from "redux";
import { FileNavigatorContext, FileNavigatorContextProps } from "./contexts";
import {
  fileNavigatorNewFileEntered,
  fileNavigatorNewFileClicked,
  fileNavigatorNewFileEscaped,
} from "@tandem-ui/designer/src/actions";
import { DropdownMenuOption } from "@tandem-ui/designer/src/components/inputs/dropdown/controller";
import { AddFileType, NewFSItemInfo } from "@tandem-ui/designer/src/state";
import { useDispatch } from "react-redux";
export type Props = {
  newFSItemInfo: NewFSItemInfo;
  activeEditorUri: string;
  rootDirectory: Directory;
  dispatch: Dispatch<any>;
  selectedFileNodeIds: string[];
  editingFileNameUri: string;
};

const generateFileNavigatorContext = memoize(
  (
    newFileInfo: NewFSItemInfo,
    selectedFileNodeIds: string[],
    onNewFileChangeComplete: any,
    onNewFileInputChange: any,
    onNewFileEscape: any,
    activeEditorUri: string,
    editingFileNameUri: string,
    dispatch: Dispatch<any>
  ): FileNavigatorContextProps => ({
    newFileInfo,
    selectedFileNodeIds,
    onNewFileChangeComplete,
    onNewFileInputChange,
    onNewFileEscape,
    dispatch,
    activeEditorUri,
    editingFileNameUri,
  })
);

const ADD_FILE_OPTIONS: DropdownMenuOption[] = [
  {
    label: "Directory",
    value: AddFileType.DIRECTORY,
  },
  {
    label: "Blank file",
    value: AddFileType.BLANK,
  },
  {
    label: "Component file",
    value: AddFileType.COMPONENT,
  },
];

export default (Base: React.ComponentClass<BaseFileNavigatorProps>) =>
  ({
    rootDirectory,
    selectedFileNodeIds,
    activeEditorUri,
    editingFileNameUri,
    newFSItemInfo,
    ...rest
  }: Props) => {
    const dispatch = useDispatch();
    const onAddFolderButtonClick = () => {
      dispatch(fileNavigatorNewFileClicked(AddFileType.DIRECTORY));
    };
    const onFileDropdownComplete = (value: AddFileType) => {
      dispatch(fileNavigatorNewFileClicked(value));
    };
    const onNewFileInputChange = (value: string) => {};
    const onNewFileChangeComplete = (name: string) => {
      if (!name) {
        return onNewFileEscape();
      }

      if (
        newFSItemInfo.fileType === AddFileType.COMPONENT &&
        !/\.pc$/.test(name)
      ) {
        name += ".pc";
      }

      dispatch(
        fileNavigatorNewFileEntered(
          name,
          newFSItemInfo.fileType === AddFileType.DIRECTORY
            ? FSItemTagNames.DIRECTORY
            : FSItemTagNames.FILE,
          newFSItemInfo.directory.id
        )
      );
    };
    const onNewFileEscape = () => {
      dispatch(fileNavigatorNewFileEscaped());
    };

    if (!rootDirectory) {
      return <Base content={EMPTY_ARRAY} addFileDropdownProps={null} />;
    }
    const content = rootDirectory.children.map((child) => {
      return <FileNavigatorLayer key={child.id} item={child as FSItem} />;
    });

    if (newFSItemInfo && rootDirectory.uri === newFSItemInfo.directory.uri) {
      content.unshift(
        <NewFileInput
          key="new-file-input"
          onChangeComplete={onNewFileChangeComplete}
          onChange={onNewFileInputChange as any}
          onEscape={onNewFileEscape}
        />
      );
    }

    return (
      <FileNavigatorContext.Provider
        value={generateFileNavigatorContext(
          newFSItemInfo,
          selectedFileNodeIds,
          onNewFileChangeComplete,
          onNewFileInputChange,
          onNewFileEscape,
          activeEditorUri,
          editingFileNameUri,
          dispatch
        )}
      >
        <Base
          {...rest}
          content={content}
          addFileDropdownProps={{
            onChangeComplete: onFileDropdownComplete,
            options: ADD_FILE_OPTIONS,
          }}
        />
      </FileNavigatorContext.Provider>
    );
  };
