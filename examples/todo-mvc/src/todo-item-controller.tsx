import * as React from "react";
import cx from "classnames";
import { BaseTodoItemProps } from "./todo-item.pc";
import { Dispatch } from "redux";
import { TodoItem } from "./state";
import { TodoAppAction } from "./actions";

export type Props = {
  dispatch: Dispatch<TodoAppAction>;
  item: TodoItem;
};

export default (Base: React.ComponentClass<BaseTodoItemProps>) =>
  class TodoItemController extends React.PureComponent<Props> {
    render() {
      const { item, ...rest } = this.props;
      return (
        <Base
          {...rest}
          variant={cx({
            completed: item.completed
          })}
          labelTextProps={{ text: item.label }}
        />
      );
    }
  };
