import * as React from "react";
import WorkspaceController0, {
  Props as WorkspaceController0Props,
} from "./controller";
import WorkspacePromptController0, {
  Props as WorkspacePromptController0Props,
} from "./prompt-controller";
import { _317401b1484197Props } from "./left-gutter/view.pc";
import { _5d6bd010465271Props } from "./editors/editor-windows.pc";
import { _694404cc2576Props } from "./bottom-gutter/view.pc";
import { _8b8bbe2c724435Props } from "./right-gutter/view.pc";
import { _9f364d214148Props } from "../../prompt/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseWorkspaceProps = {
  leftGutterProps: _317401b1484197Props;
  centerProps?: ElementProps;
  welcomeProps?: _1ecbd3329725Props;
  editorWindowsProps: _5d6bd010465271Props;
  bottomGutterProps: _694404cc2576Props;
  rightGutterProps: _8b8bbe2c724435Props;
} & ElementProps;

export type _33b1b6b133319Props = WorkspaceController0Props;
export const Workspace: (
  props: WorkspaceController0Props
) => React.ReactElement<WorkspaceController0Props>;

export type BaseWelcomeProps = {
  headerProps?: ElementProps;
  textProps?: TextProps;
  textProps1?: TextProps;
} & ElementProps;

export type _1ecbd3329725Props = BaseWelcomeProps;

export const Welcome: (
  props: BaseWelcomeProps
) => React.ReactElement<BaseWelcomeProps>;

export type BaseWorkspacePromptProps = {} & _9f364d214148Props;

export type _9f364d2186938Props = WorkspacePromptController0Props;
export const WorkspacePrompt: (
  props: WorkspacePromptController0Props
) => React.ReactElement<WorkspacePromptController0Props>;
