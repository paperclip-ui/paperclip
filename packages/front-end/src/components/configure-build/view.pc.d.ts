import * as React from "react";
import ConfigureBuildModalController0, {
  Props as ConfigureBuildModalController0Props
} from "./controller";
import { _7149f8192509Props } from "../inputs/molecules.pc";
import { _7149f8199122Props } from "../inputs/text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseConfigureBuildModalProps = {
  backgroundProps?: ElementProps;
  elementProps?: ElementProps;
  headerProps?: ElementProps;
  textProps?: TextProps;
  closeButtonProps?: TextProps;
  contentProps?: ElementProps;
  buildScriptProps?: _7149f8192509Props;
  buildCommandInputProps: _7149f8199122Props;
  buildScriptProps1?: _7149f8192509Props;
  openCommandInputProps: _7149f8199122Props;
} & ElementProps;

export type _18a9cfc32689Props = ConfigureBuildModalController0Props;
export const ConfigureBuildModal: (
  props: ConfigureBuildModalController0Props
) => React.ReactElement<ConfigureBuildModalController0Props>;
