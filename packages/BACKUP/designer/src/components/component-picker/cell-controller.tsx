import * as React from "react";
import { BaseComponentOptionProps } from "./cell.pc";

export type Props = BaseComponentOptionProps;

export default (Base: React.ComponentClass<BaseComponentOptionProps>) =>
  class CellController extends React.PureComponent<Props> {
    render() {
      return <Base {...this.props} />;
    }
  };
