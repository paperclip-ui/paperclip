import * as React from "react";
import { BaseHexInputProps } from "./picker.pc";

export type Props = BaseHexInputProps;

export default (Base: React.ComponentClass<any>) =>
  class HexInputController extends React.PureComponent<Props> {
    render() {
      return <Base {...this.props} />;
    }
  };
