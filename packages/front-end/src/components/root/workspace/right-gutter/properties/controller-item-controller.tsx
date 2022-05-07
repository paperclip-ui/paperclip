import * as React from "react";
import cx from "classnames";
import { openControllerButtonClicked } from "../../../../../actions";
import { Dispatch } from "redux";
import { BaseControllerItemProps } from "./controller-item.pc";

export type Props = {
  selected: boolean;
  onClick: any;
  dispatch: Dispatch<any>;
  relativePath: string;
};

export default (Base: React.ComponentClass<BaseControllerItemProps>) => {
  return class ControllerItemController extends React.PureComponent<Props> {
    onClick = () => {
      this.props.onClick(this.props.relativePath);
    };
    onOpenClick = (event: React.MouseEvent<any>) => {
      event.stopPropagation();
      const { dispatch, relativePath } = this.props;
      dispatch(openControllerButtonClicked(relativePath));
    };
    render() {
      const { onOpenClick, onClick } = this;
      const { relativePath, selected } = this.props;
      return (
        <Base
          onClick={onClick}
          openButtonProps={{ onClick: onOpenClick }}
          labelProps={{ text: relativePath }}
          variant={cx({ selected })}
        />
      );
    }
  };
};
