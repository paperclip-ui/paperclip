import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseEditorTabProps = {
  variant?: string;
  labelProps?: TextProps;
  xButtonProps?: TextProps;
  selectedProps?: ElementProps;
  hoveringProps?: ElementProps;
} & ElementProps;

export type _fde5849e96847Props = BaseEditorTabProps;

export const EditorTab: (
  props: BaseEditorTabProps
) => React.ReactElement<BaseEditorTabProps>;
