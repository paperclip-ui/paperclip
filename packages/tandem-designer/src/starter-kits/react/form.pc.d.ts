import * as React from "react";
import { _7149f8192509Props } from "../../components/inputs/molecules.pc";
import { _7149f8199122Props } from "../../components/inputs/text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseReactStartKitOptionsFormProps = {
  labeledInputProps?: _7149f8192509Props;
} & ElementProps;

export type _ac29cd45169Props = BaseReactStartKitOptionsFormProps;

export const ReactStartKitOptionsForm: (
  props: BaseReactStartKitOptionsFormProps
) => React.ReactElement<BaseReactStartKitOptionsFormProps>;
