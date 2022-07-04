import * as React from "react";
import { BaseMainProps } from "./view.pc";
import { reload } from "../../../actions";
import { useDispatch } from "react-redux";

export type Props = {};

export default (Base: React.ComponentClass<BaseMainProps>) => (props: Props) => {
  const dispatch = useDispatch();
  const onResetClick = () => {
    dispatch(reload());

    // safety measure incase reload action handler is not working
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    return <Base {...props} restartButtonProps={{ onClick: onResetClick }} />;
  };
};
