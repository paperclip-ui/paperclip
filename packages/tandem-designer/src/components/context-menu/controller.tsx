import * as React from "react";
import { BaseContextMenuProps } from "./view.pc";
import { Point } from "tandem-common";
import { ContextMenuOption } from "../../state";

export type Props = {
  anchor: Point;
  options: ContextMenuOption[];
} & BaseContextMenuProps;

export const ContextMenuContext = React.createContext({});

export default (Base: React.ComponentClass<BaseContextMenuProps>) =>
  class ContextMenuController extends React.PureComponent<Props> {
    render() {
      const { anchor, options, ...rest } = this.props;
      return <Base style={anchor} {...rest} />;
    }
  };
