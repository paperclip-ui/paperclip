import * as React from "react";
import VariablesInputController0, {
  Props as VariablesInputController0Props
} from "./controller";
import VariableRowItemController0, {
  Props as VariableRowItemController0Props
} from "./row-item-controller";
import VariablesTabController0, {
  Props as VariablesTabController0Props
} from "./tab-controller";
import { _b6c162d113Props } from "../../../../pane/view.pc";
import { _50e32bec2591Props } from "../../../../inputs/dropdown/view.pc";
import { _7149f8199122Props } from "../../../../inputs/text/view.pc";
import { _d227ff68826768Props } from "../../../../inputs/color/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseVariablesInputProps = {
  items?: any;
  paneProps?: _b6c162d113Props;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  addVariableButtonProps: _50e32bec2591Props;
} & ElementProps;

export type _cc878eb551695Props = VariablesInputController0Props;
export const VariablesInput: (
  props: VariablesInputController0Props
) => React.ReactElement<VariablesInputController0Props>;

export type BaseVariableRowItemProps = {
  variant?: string;
  altProps?: ElementProps;
  nameInputProps: _7149f8199122Props;
  colorInputProps: _d227ff68826768Props;
  limitedInputProps: _50e32bec2591Props;
  unlimitedInputProps: _7149f8199122Props;
  limitedProps?: ElementProps;
  colorProps?: ElementProps;
} & _cc878eb5615551Props;

export type _4b46931a1081431Props = VariableRowItemController0Props;
export const VariableRowItem: (
  props: VariableRowItemController0Props
) => React.ReactElement<VariableRowItemController0Props>;

export type BaseVariableRowProps = {
  variant?: string;
  name?: any;
  value?: any;
  textProps?: TextProps;
  textProps1?: TextProps;
  headerProps?: ElementProps;
  altProps?: ElementProps;
} & ElementProps;

export type _cc878eb5615551Props = BaseVariableRowProps;

export const VariableRow: (
  props: BaseVariableRowProps
) => React.ReactElement<BaseVariableRowProps>;

export type BaseVariablesTabProps = {
  variant?: string;
  variablesInputProps: _cc878eb551695Props;
  noGlobalFileProps?: ElementProps;
  textProps?: TextProps;
} & ElementProps;

export type _3a6461fb1889702Props = VariablesTabController0Props;
export const VariablesTab: (
  props: VariablesTabController0Props
) => React.ReactElement<VariablesTabController0Props>;
