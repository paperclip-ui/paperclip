import * as React from "react";
import cx from "classnames";
import {
  BaseBuildButtonProps,
  BuildButtonOption,
  BuildButtonMenu
} from "./view.pc";
import { Dispatch } from "redux";
import {
  buildButtonStartClicked,
  buildButtonConfigureClicked,
  buildButtonStopClicked,
  buildButtonOpenAppClicked
} from "../../../actions";
import { last } from "lodash";
import { ScriptProcess } from "../../../state";

export type Props = {
  dispatch: Dispatch<any>;
  buildScriptProcess?: ScriptProcess;
  hasOpenScript: boolean;
  hasBuildScript: boolean;
};

type State = {
  open?: boolean;
};

export default (Base: React.ComponentClass<BaseBuildButtonProps>) =>
  class BuildButtonController extends React.PureComponent<Props, State> {
    state = {
      open: false
    };
    onBuildButtonClick = () => {
      if (!this.state.open) {
        this.setState({
          open: true
        });
      }
    };
    onShouldClose = () => {
      this.closeMenu();
    };
    onStartClick = () => {
      this.props.dispatch(buildButtonStartClicked());
      this.closeMenu();
    };
    onConfigureClick = () => {
      this.props.dispatch(buildButtonConfigureClicked());
      this.closeMenu();
    };
    onStopClick = () => {
      this.props.dispatch(buildButtonStopClicked());
      this.closeMenu();
    };
    onOpenAppClick = () => {
      this.props.dispatch(buildButtonOpenAppClicked());
      this.closeMenu();
    };
    closeMenu() {
      this.setState({ open: false });
    }
    render() {
      const {
        onShouldClose,
        onBuildButtonClick,
        onStartClick,
        onOpenAppClick,
        onStopClick,
        onConfigureClick
      } = this;
      const { open } = this.state;
      const {
        buildScriptProcess,
        hasBuildScript,
        hasOpenScript,
        ...rest
      } = this.props;

      let building = Boolean(buildScriptProcess);
      let errored = false;
      let label: string;

      if (buildScriptProcess) {
        label = "Building project";
        const lastLog = last(buildScriptProcess.logs);
        errored = lastLog && lastLog.error;
      } else {
        label = "Build stopped";
      }

      let buildButtonMenuItems = [];

      if (!building) {
        buildButtonMenuItems = [
          <BuildButtonOption
            key="configure"
            labelProps={{ text: "Configure" }}
            onClick={onConfigureClick}
          />,
          hasBuildScript ? (
            <BuildButtonOption
              key="start"
              labelProps={{ text: "Start" }}
              onClick={onStartClick}
            />
          ) : null
        ];
      } else {
        buildButtonMenuItems = [
          <BuildButtonOption
            key="configure"
            labelProps={{ text: "Configure" }}
            onClick={onConfigureClick}
          />,
          hasOpenScript ? (
            <BuildButtonOption
              key="configure"
              labelProps={{ text: "Open app" }}
              onClick={onOpenAppClick}
            />
          ) : null,
          <BuildButtonOption
            key="configure"
            labelProps={{ text: "Stop" }}
            onClick={onStopClick}
          />
        ];
      }

      buildButtonMenuItems = buildButtonMenuItems.filter(Boolean);

      return (
        <Base
          {...rest}
          variant={cx({
            building,
            paused: !building
          })}
          popoverProps={{
            open,
            onShouldClose,
            centered: true
          }}
          labelProps={{
            text: label
          }}
          buildButtonProps={{
            onMouseDown: onBuildButtonClick
          }}
          buildButtonMenuProps={{
            items: buildButtonMenuItems
          }}
        />
      );
    }
  };
