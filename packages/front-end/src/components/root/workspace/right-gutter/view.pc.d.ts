import * as React from "react";
import RightGutterController0, {
  Props as RightGutterController0Props
} from "./controller";
import GlobalPropertiesController0, {
  Props as GlobalPropertiesController0Props
} from "./global-properties-controller";
import { _5d7d4069129476Props } from "./tab.pc";
import { _45055e8e9Props } from "./styles/view.pc";
import { _9208d19593983Props } from "./properties/view.pc";
import { _97a34b151010442Props } from "../../../dev/comments.pc";
import { _3a6461fb1889702Props } from "./variables/view.pc";
import { _66811b5c421Props } from "./queries/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseRightGutterProps = {
  variant?: string;
  tabsProps?: ElementProps;
  tabProps?: _5d7d4069129476Props;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  tabProps1?: _5d7d4069129476Props;
  contentProps?: ElementProps;
  stylesProps: _45055e8e9Props;
  propertiesProps: _9208d19593983Props;
  globalPropertiesProps: _9a387b6144810Props;
  codeTabProps?: _6b6efac4Props;
  propertiesTabProps?: ElementProps;
  variablesTabProps?: ElementProps;
  stylesTabProps?: ElementProps;
  codeTabProps1?: ElementProps;
  globalsTabProps?: ElementProps;
  unselectedNodesProps?: ElementProps;
} & ElementProps;

export type _8b8bbe2c724435Props = RightGutterController0Props;
export const RightGutter: (
  props: RightGutterController0Props
) => React.ReactElement<RightGutterController0Props>;

export type BaseDrawerProps = {} & ElementProps;

export type _63257bfd4943Props = BaseDrawerProps;

export const Drawer: (
  props: BaseDrawerProps
) => React.ReactElement<BaseDrawerProps>;

export type BaseCodeTabProps = {} & ElementProps;

export type _6b6efac4Props = BaseCodeTabProps;

export const CodeTab: (
  props: BaseCodeTabProps
) => React.ReactElement<BaseCodeTabProps>;

export type BaseGlobalPropertiesProps = {
  variablesSectionProps: _3a6461fb1889702Props;
  queriesPaneProps: _66811b5c421Props;
} & ElementProps;

export type _9a387b6144810Props = GlobalPropertiesController0Props;
export const GlobalProperties: (
  props: GlobalPropertiesController0Props
) => React.ReactElement<GlobalPropertiesController0Props>;
