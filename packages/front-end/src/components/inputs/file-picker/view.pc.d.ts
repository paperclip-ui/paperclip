import * as React from "react";
import FileInputController0, {
  Props as FileInputController0Props
} from "./controller";
import { _7149f8199122Props } from "../text/view.pc";
import { _9f364d2139415Props } from "../button/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseFileInputProps = {
  filePathInputProps: _7149f8199122Props;
  elementProps?: ElementProps;
  browseButtonProps?: _9f364d2139415Props;
} & ElementProps;

export type _9fb9afea1357Props = FileInputController0Props;
export const FileInput: (
  props: FileInputController0Props
) => React.ReactElement<FileInputController0Props>;
