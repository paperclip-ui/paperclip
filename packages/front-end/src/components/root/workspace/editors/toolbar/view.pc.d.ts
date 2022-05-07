import * as React from "react";
import ToolbarController0, {
  Props as ToolbarController0Props
} from "./controller";
import {
  _bc641d4124463Props,
  _bc641d4113153Props,
  _bc641d4118808Props,
  _bc641d484882Props
} from "../../../../../icons/view.pc";
import { _9b7b527f175442Props } from "../../../../popover/view.pc";
import { _936f29271359Props } from "../../../../component-picker/picker.pc";
import { _bae08a2e609807Props } from "../paperclip/stage/canvas/tools-layer/frames-view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseToolbarProps = {
  variant?: string;
  toolsProps?: ElementProps;
  pointerProps?: _3ee7fcc51260Props;
  pointerIconProps?: _bc641d4124463Props;
  textProps?: _3ee7fcc51260Props;
  textIconProps?: _bc641d4113153Props;
  elementProps?: _3ee7fcc51260Props;
  rectangleIconProps?: _bc641d4118808Props;
  componentProps: _9b7b527f175442Props;
  componentIconProps?: _3ee7fcc51260Props;
  puzzleIconProps?: _bc641d484882Props;
  componentPopdownPickerProps: _936f29271359Props;
  tabsProps?: _fde5849e79779Props;
  activeProps?: ElementProps;
} & ElementProps;

export type _ab406a6b770940Props = ToolbarController0Props;
export const Toolbar: (
  props: ToolbarController0Props
) => React.ReactElement<ToolbarController0Props>;

export type BaseEditorTabsProps = {} & ElementProps;

export type _fde5849e79779Props = BaseEditorTabsProps;

export const EditorTabs: (
  props: BaseEditorTabsProps
) => React.ReactElement<BaseEditorTabsProps>;

export type BaseToolbarButtonProps = {
  variant?: string;
  icon?: any;
  pointerIconProps?: _bc641d4124463Props;
  selectedProps?: ElementProps;
} & ElementProps;

export type _3ee7fcc51260Props = BaseToolbarButtonProps;

export const ToolbarButton: (
  props: BaseToolbarButtonProps
) => React.ReactElement<BaseToolbarButtonProps>;
