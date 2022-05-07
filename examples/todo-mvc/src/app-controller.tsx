import * as React from "react";
import cx from "classnames";
import { BaseAppProps } from "./main.pc";
import { RootState, TodoItemFilter } from "./state";
import { reducer } from "./reducer";
import {
  TodoAppAction,
  todoInputEntered,
  todoFilterItemButtonClicked
} from "./actions";
import { TodoItem } from "./todo-item.pc";

export type Props = {};

export default (Base: React.ComponentClass<BaseAppProps>) =>
  class AppController extends React.PureComponent<Props, RootState> {
    state: RootState = {
      todos: [],
      filter: TodoItemFilter.ALL
    };

    onInputKeyDown = (event: React.KeyboardEvent<any>) => {
      if (event.key === "Enter") {
        this.dispatch(
          todoInputEntered((event.target as HTMLInputElement).value)
        );
      }
    };

    // placeholder for actual reducer code
    dispatch = (action: TodoAppAction) => {
      this.setState(reducer(this.state, action));
      return null;
    };

    render() {
      const { ...rest } = this.props;
      const { todos, filter } = this.state;
      const { onInputKeyDown, dispatch } = this;

      const todoItems = todos
        .filter(item => {
          if (filter === TodoItemFilter.ALL) {
            return true;
          } else if (filter === TodoItemFilter.COMPLETED) {
            return item.completed;
          } else if (filter === TodoItemFilter.ACTIVE) {
            return !item.completed;
          }
        })
        .map((item, key) => {
          return <TodoItem key={key} item={item} dispatch={dispatch} />;
        });

      return (
        <Base
          {...rest}
          todoInputProps={{
            onKeyDown: onInputKeyDown
          }}
          itemsProps={{
            children: todoItems
          }}
          allFilterButtonProps={{
            dispatch,
            label: "All",
            type: TodoItemFilter.ALL,
            selected: filter === TodoItemFilter.ALL
          }}
          activeFilterButtonProps={{
            dispatch,
            label: "Active",
            type: TodoItemFilter.ACTIVE,
            selected: filter === TodoItemFilter.ACTIVE
          }}
          completedFilterButtonProps={{
            dispatch,
            label: "Completed",
            type: TodoItemFilter.COMPLETED,
            selected: filter === TodoItemFilter.COMPLETED
          }}
        />
      );
    }
  };
