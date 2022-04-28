import * as React from "react";
import * as cx from "classnames";
import { BaseFooterButtonProps } from "./footer-button.pc";
import { Dispatch } from "redux";
import { TodoAppAction, todoFilterItemButtonClicked } from "./actions";
import { TodoItemFilter } from "./state";
export type Props = {
  type: TodoItemFilter;
  selected: boolean;
  label?: string;
  dispatch: Dispatch<TodoAppAction>;
};
export default (Base: React.ComponentClass<BaseFooterButtonProps>) =>
  class FooterButtonController extends React.PureComponent<Props> {
    onClick = () => {
      this.props.dispatch(todoFilterItemButtonClicked(this.props.type));
    };
    render() {
      const { label, selected, ...rest } = this.props;
      const { onClick } = this;
      return (
        <Base
          {...rest}
          variant={cx({ active: selected })}
          onClick={onClick}
          labelTextProps={{ text: label }}
        />
      );
    }
  };
