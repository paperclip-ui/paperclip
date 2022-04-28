import * as React from "react";
import { BaseApplicationProps, ListItem } from "./main.pc";
import { RootState } from "./state";
import { Action } from "redux";
import reducer from "./reducer";
import {
  addItemButtonClicked,
  addItemInputChanged,
  addItemInputEntered,
  clearCompletedButtonClicked,
  TodoAppAction
} from "./actions";

export type Props = {} & BaseApplicationProps;

export default (Base: React.ComponentClass<BaseApplicationProps>) =>
  class ApplicationController extends React.PureComponent<Props, RootState> {
    state: RootState = {
      todoItems: []
    };

    onInputKeyDown = (event: React.KeyboardEvent<any>) => {
      if (event.key === "Enter") {
        this.dispatch(addItemInputEntered());
        (event.target as HTMLInputElement).value = "";
      } else {
        const nativeEvent = event.nativeEvent;

        // Hacky: debounce to ensure that we ge the _last_ key.
        setTimeout(() => {
          this.dispatch(
            addItemInputChanged((nativeEvent.target as HTMLInputElement).value)
          );
        }, 10);
      }
    };
    onAddItemClick = () => {
      this.dispatch(addItemButtonClicked());
    };
    onClearCompletedClick = () => {
      this.dispatch(clearCompletedButtonClicked());
    };

    dispatch = (action: TodoAppAction): any => {
      this.setState(reducer(this.state, action));
    };
    render() {
      const { ...rest } = this.props;
      const { todoItems } = this.state;
      const {
        onAddItemClick,
        onClearCompletedClick,
        onInputKeyDown,
        dispatch
      } = this;

      const todoItemChildren = todoItems.map(item => {
        return <ListItem key={item.id} item={item} dispatch={dispatch} />;
      });

      return (
        <Base
          {...rest}
          inputProps={{
            onKeyDown: onInputKeyDown
          }}
          addItemButtonProps={{ onClick: onAddItemClick }}
          items={todoItemChildren}
          clearCompletedButtonProps={{ onClick: onClearCompletedClick }}
        />
      );
    }
  };
