import * as React from "react";
import cx from "classnames";
import { BaseStarterKitFormOptionsProps } from "./form.pc";
import { Dispatch } from "redux";
import { ProjectTemplate } from "tandem-starter-kits";
import { browseDirectoryClicked } from "../actions";

export type Options = {
  directory: string;
};

export type Props = {
  template: ProjectTemplate;
  onChangeComplete: (options: Options) => void;
  selectedDirectory: string;
  dispatch: Dispatch<any>;
};

type State = {
  directory: string;
  _directory: string;
};

export default (Base: React.ComponentClass<BaseStarterKitFormOptionsProps>) =>
  class FormController extends React.PureComponent<Props, State> {
    state = {
      directory: null,
      _directory: null,
    };
    static getDerivedStateFromProps = (props: Props, state: State) => {
      let newState = state;
      if (
        props.selectedDirectory &&
        props.selectedDirectory !== state._directory
      ) {
        newState = {
          ...newState,
          _directory: props.selectedDirectory,
          directory: props.selectedDirectory,
        };
      }
      return newState !== state ? newState : null;
    };
    onCreateButtonClick = () => {
      if (!this.isValid()) {
        return null;
      }
      this.props.onChangeComplete({
        directory: this.state.directory,
      });
    };
    onBrowserDirectoryClick = () => {
      this.props.dispatch(browseDirectoryClicked());
    };
    onDirectoryChange = (directory) => {
      this.setState({ ...this.state, directory });
    };
    isValid = () => {
      return this.state.directory != null;
    };
    render() {
      const {
        onBrowserDirectoryClick,
        onDirectoryChange,
        onCreateButtonClick,
      } = this;
      const { template, ...rest } = this.props;
      const { directory } = this.state;
      const valid = this.isValid();
      return (
        <Base
          {...rest}
          titleProps={{
            text: `New ${template.label} Project`,
          }}
          directoryInputProps={{
            value: directory,
            onChange: onDirectoryChange,
          }}
          browseButtonProps={{
            onClick: onBrowserDirectoryClick,
          }}
          createProjectButtonProps={{
            variant: cx({
              disabled: !valid,
            }),
            onClick: onCreateButtonClick,
          }}
        />
      );
    }
  };
