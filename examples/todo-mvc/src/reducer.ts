import { RootState, createTodo } from "./state";
import { Action } from "redux";
import { TodoAppAction, ActionType } from "./actions";

export const reducer = (state: RootState, action: TodoAppAction): RootState => {
  switch (action.type) {
    case ActionType.TODO_INPUT_ENTERED: {
      state = {
        ...state,
        todos: [...state.todos, createTodo(action.value)]
      };
      return state;
    }
    case ActionType.TODO_ITEM_COMPLETE_CHECKBOX_CLICKED: {
      state = {
        ...state,
        todos: state.todos.map(
          todo =>
            todo.id === action.item.id
              ? {
                  ...todo,
                  completed: !todo.completed
                }
              : todo
        )
      };
      return state;
    }
    case ActionType.TODO_LIST_CLEAR_COMPLETED_CLICKED: {
      state = {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
      return state;
    }
    case ActionType.TODO_ITEM_FILTER_BUTTON_CLICKED: {
      state = {
        ...state,
        filter: action.filterType
      };
      return state;
    }
  }

  return state;
};
