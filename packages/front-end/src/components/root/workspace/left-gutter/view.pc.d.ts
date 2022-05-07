import * as React from "react";
import LeftGutterController0, {
  Props as LeftGutterController0Props
} from "./controller";
import { _b34e7ef42482727Props } from "./open-files/view.pc";
import { _b6c162d113Props } from "../../../pane/view.pc";
import { _5a14767c291836Props } from "./file-navigator/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseLeftGutterProps = {
  openModulesPaneProps: _b34e7ef42482727Props;
  fileNavigatorPaneProps: _5a14767c291836Props;
  draggerProps?: ElementProps;
} & ElementProps;

export type _317401b1484197Props = LeftGutterController0Props;
export const LeftGutter: (
  props: LeftGutterController0Props
) => React.ReactElement<LeftGutterController0Props>;
