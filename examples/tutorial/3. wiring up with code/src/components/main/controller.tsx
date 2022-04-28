import * as React from "react";
import { BaseApplicationProps, Item } from "./view.pc";

export type Props = {} & BaseApplicationProps;

type State = {
  newTodoText?: string;
  todos: string[];
};

export default (Base: React.ComponentClass<BaseApplicationProps>) =>
  class ApplicationController extends React.PureComponent<Props, State> {
    state = {
      newTodoText: null,
      todos: []
    };
    onNewInputChange = (event: React.KeyboardEvent<any>) => {
      this.setState({
        newTodoText: (event.target as HTMLInputElement).value
      });
    };
    onAddTodoClick = (event: React.MouseEvent<any>) => {
      if (!this.state.newTodoText) {
        return null;
      }
      this.setState({
        todos: [...this.state.todos, this.state.newTodoText],
        newTodoText: null
      });
    };
    render() {
      const { onNewInputChange, onAddTodoClick } = this;
      const { todos } = this.state;
      const { ...rest } = this.props;
      const items = todos.map(todo => <Item label={todo} />);

      return (
        <Base
          {...rest}
          itemsProps={{ children: items }}
          addNewItemInputProps={{
            onChange: onNewInputChange
          }}
          addTodoButtonProps={{ onClick: onAddTodoClick }}
        />
      );
    }
  };
