import * as React from "react";
import { BaseItemProps } from "./view.pc";

export type Props = {
  label: string;
};

export default (Base: React.ComponentClass<BaseItemProps>) =>
  class ItemController extends React.PureComponent<Props> {
    render() {
      const { label, ...rest } = this.props;
      return <Base {...rest} labelProps={{ text: label }} />;
    }
  };
