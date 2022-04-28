import {
  RootState,
  addTodoItem,
  clearCompleted,
  toggleCompleted
} from "./state";
import { TodoAppAction, TodoAppActionType } from "./actions";

export default (state: RootState, action: TodoAppAction) => {
  switch (action.type) {
    case TodoAppActionType.ADD_ITEM_BUTTON_CLICKED:
    case TodoAppActionType.ADD_ITEM_INPUT_ENTERED: {
      state = state.currentInputValue
        ? addTodoItem(state.currentInputValue, state)
        : state;
      state = { ...state, currentInputValue: undefined };
      return state;
    }
    case TodoAppActionType.ADD_ITEM_INPUT_CHANGED: {
      state = { ...state, currentInputValue: action.value };
      return state;
    }
    case TodoAppActionType.CLEAR_COMPLETED_BUTTON_CLICKED: {
      state = clearCompleted(state);
      return state;
    }
    case TodoAppActionType.TOGGLE_ITEM_CLICKED: {
      state = toggleCompleted(action.item.id, state);
      return state;
    }
  }

  return state;
};
