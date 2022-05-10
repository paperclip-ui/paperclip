import * as React from "react";
import OpenModuleController0, {
  Props as OpenModuleController0Props,
} from "./open-module-controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseOpenModuleProps = {
  contentProps?: ElementProps;
} & ElementProps;

export type _fe256b416Props = OpenModuleController0Props;
export const OpenModule: (
  props: OpenModuleController0Props
) => React.ReactElement<OpenModuleController0Props>;
