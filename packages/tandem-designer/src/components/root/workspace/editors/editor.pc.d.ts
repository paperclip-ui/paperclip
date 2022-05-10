import * as React from "react";
import EditorController0, {
  Props as EditorController0Props,
} from "./editor-controller";
import { _ab406a6b770940Props } from "./toolbar/view.pc";
import { _174f96bb76034Props } from "./footer/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseEditorProps = {
  variant?: string;
  toolbarProps: _ab406a6b770940Props;
  contentProps?: ElementProps;
  editorFooterProps: _174f96bb76034Props;
  activeProps?: ElementProps;
} & ElementProps;

export type _483373f987277Props = EditorController0Props;
export const Editor: (
  props: EditorController0Props
) => React.ReactElement<EditorController0Props>;
