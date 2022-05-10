import * as React from "react";
import { BaseMainProps } from "./view.pc";
import { Dispatch } from "redux";
import { reload } from "../../../actions";

export type Props = {
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseMainProps>) =>
  class BaseReporterController extends React.PureComponent<Props> {
    onResetClick = () => {
      this.props.dispatch(reload());

      // safety measure incase reload action handler is not working
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    render() {
      const { onResetClick } = this;
      const { ...rest } = this.props;
      return <Base {...rest} restartButtonProps={{ onClick: onResetClick }} />;
    }
  };
