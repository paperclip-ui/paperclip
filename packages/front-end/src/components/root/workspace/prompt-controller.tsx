import * as React from "react";
import { BaseWorkspacePromptProps } from "./view.pc";
import { Dispatch } from "redux";
import { RootState, Prompt } from "../../../state";
import { promptConfirmed, promptCancelButtonClicked } from "../../../actions";

type MappedProps = {
  options: Prompt;
};

export type Props = {
  dispatch: Dispatch<any>;
} & MappedProps;

export const mapStateToProps = ({ prompt }: RootState): MappedProps => {
  if (!prompt) {
    return null;
  }

  return {
    options: prompt
  };
};

export default (Base: React.ComponentClass<BaseWorkspacePromptProps>) =>
  class WorkspacePromptController extends React.PureComponent<Props> {
    onOk = (value: string) => {
      this.props.dispatch(
        value
          ? promptConfirmed(value, this.props.options.okActionType)
          : promptCancelButtonClicked()
      );
    };
    onCancel = () => {
      this.props.dispatch(promptCancelButtonClicked());
    };
    render() {
      const {
        options: { label, defaultValue },
        ...rest
      } = this.props;
      const { onCancel, onOk } = this;
      return (
        <Base
          {...rest}
          label={label}
          defaultValue={defaultValue}
          onCancel={onCancel}
          onOk={onOk}
        />
      );
    }
  };
