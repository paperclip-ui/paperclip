import React from "react";
import { RootState, ToolType } from "../../state";
import { Dispatch } from "redux";
import { componentPickerBackgroundClick } from "../../actions";
import { BaseModalProps } from "./modal.pc";
import { useDispatch } from "react-redux";

export type Props = {
  root: RootState;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseModalProps>) =>
  (props: Props) => {
    const dispatch = useDispatch();
    // const onBackgroundClick = () => {
    //   dispatch(componentPickerBackgroundClick());
    // };
    return null;
  };
