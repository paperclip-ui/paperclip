import * as React from "react";
import { RootState } from "../../state";
import { Dispatch } from "redux";
import { quickSearchBackgroundClick } from "../../actions";
import { BaseModalProps } from "./view.pc";

export type Props = {
  root: RootState;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseModalProps>) =>
  class ModalController extends React.PureComponent<Props> {
    onBackgroundClick = () => {
      this.props.dispatch(quickSearchBackgroundClick());
    };
    render() {
      const { root, dispatch } = this.props;
      const { onBackgroundClick } = this;
      if (!root.showQuickSearch) {
        return null;
      }
      return (
        <Base
          backgroundProps={{
            onClick: onBackgroundClick,
          }}
          quickSearchProps={{
            quickSearch: root.quickSearch,
            dispatch,
          }}
        />
      );
    }
  };
