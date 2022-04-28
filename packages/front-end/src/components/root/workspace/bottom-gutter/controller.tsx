import * as React from "react";
import { BaseBottomGutterProps } from "./view.pc";
import { Dispatch } from "redux";
import { ScriptProcess } from "../../../../state";
import { closeBottomGutterButtonClicked } from "../../../../actions";

export type Props = {
  show: boolean;
  scriptProcesses: ScriptProcess[];
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseBottomGutterProps>) =>
  class BottomGutterController extends React.PureComponent<Props> {
    onCloseClick = () => {
      this.props.dispatch(closeBottomGutterButtonClicked());
    };
    render() {
      const { onCloseClick } = this;
      const { show, dispatch, scriptProcesses, ...rest } = this.props;
      if (!show) {
        return false;
      }
      return (
        <Base
          {...rest}
          closeButtonProps={{
            onClick: onCloseClick
          }}
          consoleProps={{
            scriptProcesses,
            dispatch
          }}
        />
      );
    }
  };
