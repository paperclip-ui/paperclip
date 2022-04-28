import * as React from "react";
import { BaseApplicationProps } from "./view.pc";

export type Props = {} & BaseApplicationProps;

export default (Base: React.ComponentClass<BaseApplicationProps>) =>
  class ApplicationController extends React.PureComponent<Props> {
    render() {
      const { ...rest } = this.props;
      return <Base {...rest} />;
    }
  };
