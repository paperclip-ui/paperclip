import * as React from "react";
import { BaseConfigureBuildModalProps } from "./view.pc";
import { Dispatch } from "redux";
import {
  configureBuildModalXClicked,
  configureBuildModalBackgroundClicked,
  openAppScriptConfigChanged,
  buildScriptConfigChanged
} from "../../actions";
import { ProjectInfo } from "../../state";
export type Props = {
  projectInfo: ProjectInfo;
  dispatch: Dispatch<any>;
};
export default (Base: React.ComponentClass<BaseConfigureBuildModalProps>) =>
  class ConfigureBuildController extends React.PureComponent<Props> {
    onCloseButtonClick = () => {
      this.props.dispatch(configureBuildModalXClicked());
    };
    onBackgroundClick = () => {
      this.props.dispatch(configureBuildModalBackgroundClicked());
    };
    onOpenCommandChangeComplete = (value: string) => {
      this.props.dispatch(openAppScriptConfigChanged(value));
    };
    onBuildCommandChangeComplete = (value: string) => {
      this.props.dispatch(buildScriptConfigChanged(value));
    };
    render() {
      const {
        onCloseButtonClick,
        onBackgroundClick,
        onBuildCommandChangeComplete,
        onOpenCommandChangeComplete
      } = this;
      const { projectInfo, dispatch, ...rest } = this.props;
      return (
        <Base
          {...rest}
          closeButtonProps={{
            onClick: onCloseButtonClick
          }}
          backgroundProps={{
            onClick: onBackgroundClick
          }}
          buildCommandInputProps={{
            onChangeComplete: onBuildCommandChangeComplete,
            value:
              projectInfo.config.scripts && projectInfo.config.scripts.build
          }}
          openCommandInputProps={{
            onChangeComplete: onOpenCommandChangeComplete,
            value:
              projectInfo.config.scripts && projectInfo.config.scripts.openApp
          }}
        />
      );
    }
  };
