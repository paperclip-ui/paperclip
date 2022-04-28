import * as React from "react";
import { BaseListItemProps } from "./main.pc";
import { TodoItem, toggleCompleted } from "./state";
import { Dispatch } from "redux";
import { toggleItemClicked, TodoAppAction } from "./actions";

export type Props = {
  item: TodoItem;
  dispatch: Dispatch<TodoAppAction>;
} & BaseListItemProps;

export default (Base: React.ComponentClass<BaseListItemProps>) =>
  class TodoItemController extends React.PureComponent<Props> {
    onCheckboxClick = () => {
      this.props.dispatch(toggleItemClicked(this.props.item));
    };
    render() {
      const { item, ...rest } = this.props;
      const { onCheckboxClick } = this;
      if (!item) {
        return null;
      }
      return (
        <Base
          {...rest}
          labelProps={{ text: item.label }}
          completedCheckboxProps={{
            defaultChecked: item.completed,
            onClick: onCheckboxClick
          }}
        />
      );
    }
  };
