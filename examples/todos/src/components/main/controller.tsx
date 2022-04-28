import * as React from "react";
import { BaseApplicationProps, Item as TodoItemComponent } from "./view.pc";

export type Props = {} & BaseApplicationProps;

type TodoItem = {
  text: string;
  completed: boolean;
};

type State = {
  todoItems: TodoItem[];
  newTodoText: string;
};

export default (Base: React.ComponentClass<BaseApplicationProps>) =>
  class ApplicationController extends React.PureComponent<Props, State> {
    state = {
      todoItems: [],
      newTodoText: null
    };

    onInputChange = (event: React.KeyboardEvent<any>) => {
      this.setState({
        ...this.state,
        newTodoText: (event.target as HTMLInputElement).value
      });
    };

    onAddTodoClick = () => {
      this.addTodoItem();
    };

    onInputKeyDown = (event: React.KeyboardEvent<any>) => {
      if (event.key === "Enter") {
        this.addTodoItem();
      }
    };

    addTodoItem() {
      if (!this.state.newTodoText) {
        return null;
      }
      this.setState({
        ...this.state,
        todoItems: [...this.state.todoItems, { text: this.state.newTodoText }],
        newTodoText: null
      });
    }

    onToggleCompletedClick = todoItemIndex => {
      this.setState({
        ...this.state,
        todoItems: this.state.todoItems.map((item, i) => {
          if (i === todoItemIndex) {
            return {
              ...item,
              completed: !item.completed
            };
          }

          return item;
        })
      });
    };

    onClearTodosClick = () => {
      this.setState({
        ...this.state,
        todoItems: this.state.todoItems.filter(item => {
          return !item.completed;
        })
      });
    };

    render() {
      const {
        onInputChange,
        onAddTodoClick,
        onInputKeyDown,
        onToggleCompletedClick,
        onClearTodosClick
      } = this;
      const { ...rest } = this.props;
      const { todoItems, newTodoText } = this.state;
      const hasCompleted = todoItems.some(item => item.completed);
      const items = todoItems.map((todoItem, i) => (
        <TodoItemComponent
          key={i}
          labelProps={{ text: todoItem.text }}
          completedInputProps={
            {
              checked: todoItem.completed,
              onClick: () => onToggleCompletedClick(i)
            } as any
          }
        />
      ));
      return (
        <Base
          {...rest}
          items={items}
          inputProps={
            {
              onChange: onInputChange,
              onKeyDown: onInputKeyDown,
              value: newTodoText || ""
            } as any
          }
          addTodoButtonProps={{ onClick: onAddTodoClick }}
          clearTodosButtonProps={{
            onClick: onClearTodosClick,
            variant: hasCompleted ? null : "disabled"
          }}
        />
      );
    }
  };
