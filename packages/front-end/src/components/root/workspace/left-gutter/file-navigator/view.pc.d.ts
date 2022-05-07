import * as React from "react";
import FileNavigatorController0, {
  Props as FileNavigatorController0Props
} from "./controller";
import FileNavigatorLayerController0, {
  Props as FileNavigatorLayerController0Props
} from "./layer-controller";
import NewFileInputController0, {
  Props as NewFileInputController0Props
} from "./new-file-controller";
import { _50e32bec2591Props } from "../../../../inputs/dropdown/view.pc";
import { _f27782548182Props } from "../../../../../icons/view.pc";
import { _d3bf183b20Props } from "../open-files/layer.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseFileNavigatorProps = {
  content?: any;
  elementProps?: ElementProps;
  textProps?: TextProps;
  controlProps?: ElementProps;
  addFileDropdownProps: _50e32bec2591Props;
  addFileButtonProps?: _f27782548182Props;
  innerProps?: ElementProps;
  elementProps1?: ElementProps;
} & ElementProps;

export type _5a14767c291836Props = FileNavigatorController0Props;
export const FileNavigator: (
  props: FileNavigatorController0Props
) => React.ReactElement<FileNavigatorController0Props>;

export type BaseFileNavigatorLayerProps = {
  variant?: string;
  folderProps?: ElementProps;
  fileProps?: ElementProps;
  selectedProps?: ElementProps;
  hoverProps?: ElementProps;
  altProps?: ElementProps;
  expandedProps?: ElementProps;
  editingProps?: ElementProps;
  blurProps?: ElementProps;
  activeProps?: ElementProps;
} & _d3bf183b20Props;

export type _5a14767c98757Props = FileNavigatorLayerController0Props;
export const FileNavigatorLayer: (
  props: FileNavigatorLayerController0Props
) => React.ReactElement<FileNavigatorLayerController0Props>;

export type BaseNewFileInputProps = {} & _d3bf183b20Props;

export type _a80047118404Props = NewFileInputController0Props;
export const NewFileInput: (
  props: NewFileInputController0Props
) => React.ReactElement<NewFileInputController0Props>;

export type BaseFileNavigatorLayerContainerProps = {
  variant?: string;
  hoveringProps?: ElementProps;
} & ElementProps;

export type _b75388d71912Props = BaseFileNavigatorLayerContainerProps;

export const FileNavigatorLayerContainer: (
  props: BaseFileNavigatorLayerContainerProps
) => React.ReactElement<BaseFileNavigatorLayerContainerProps>;
