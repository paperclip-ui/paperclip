import * as React from "react";
import CodeController0, { Props as CodeController0Props } from "./code";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import { _d65d17fd4015Props } from "../../../../../../inputs/textarea/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseCodeProps = {
  textareaProps: _d65d17fd4015Props;
  textProps?: TextProps;
} & _b6c162d113Props;

export type _decafdc7265667Props = CodeController0Props;
export const Code: (
  props: CodeController0Props
) => React.ReactElement<CodeController0Props>;
