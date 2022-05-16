import * as React from "react";
import { RootState, ToolType } from "../../state";
import { Dispatch } from "redux";
import { componentPickerBackgroundClick } from "../../actions";
import { BaseModalProps } from "./modal.pc";

export type Props = {
  root: RootState;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseModalProps>) =>
  class ModalController extends React.PureComponent<Props> {
    onBackgroundClick = () => {
      this.props.dispatch(componentPickerBackgroundClick());
    };
    render() {
      const { root, dispatch } = this.props;
      const { onBackgroundClick } = this;
      // if (root.toolType === ToolType.COMPONENT && !root.selectedComponentId) {
      //   return (
      //     <Base
      //       backgroundProps={{
      //         onClick: onBackgroundClick
      //       }}
      //       pickerProps={{
      //         root,
      //         dispatch
      //       }}
      //     />
      //   );
      // }
      return null;
    }
  };
