import { State, OperatorType, addNumber } from "./state";
import { Action, MainActionType } from "./actions";

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case MainActionType.CLEAR_BUTTON_CLICKED: {
      state = {
        current: 0,
        result: 0,
        selectedOperator: null
      };
      return state;
    }
    case MainActionType.TOGGLE_POSITIVE_BUTTON_CLICKED: {
      return state;
    }
    case MainActionType.DECIMAL_BUTTON_CLICKED: {
      return state;
    }
    case MainActionType.DIVIDE_BUTTON_CLICKED: {
      state = { ...state, selectedOperator: OperatorType.DIVIDE };
      return state;
    }
    case MainActionType.SEVEN_BUTTON_CLICKED: {
      state = addNumber(7, state);
      return state;
    }
    case MainActionType.EIGHT_BUTTON_CLICKED: {
      state = addNumber(8, state);
      return state;
    }
    case MainActionType.NINE_BUTTON_CLICKED: {
      state = addNumber(9, state);
      return state;
    }
    case MainActionType.MULTIPLY_BUTTON_CLICKED: {
      state = { ...state, selectedOperator: OperatorType.MULTIPLY };
      return state;
    }
    case MainActionType.FOUR_BUTTON_CLICKED: {
      state = addNumber(4, state);
      return state;
    }
    case MainActionType.FIVE_BUTTON_CLICKED: {
      state = addNumber(5, state);
      return state;
    }
    case MainActionType.SIX_BUTTON_CLICKED: {
      state = addNumber(6, state);
      return state;
    }
    case MainActionType.MINUS_BUTTON_CLICKED: {
      state = { ...state, selectedOperator: OperatorType.MINUS };
      return state;
    }
    case MainActionType.ONE_BUTTON_CLICKED: {
      state = addNumber(1, state);
      return state;
    }
    case MainActionType.TWO_BUTTON_CLICKED: {
      state = addNumber(2, state);
      return state;
    }
    case MainActionType.THREE_BUTTON_CLICKED: {
      state = addNumber(3, state);
      return state;
    }
    case MainActionType.PLUS_BUTTON_CLICKED: {
      state = { ...state, selectedOperator: OperatorType.PLUS };
      return state;
    }
    case MainActionType.ZERO_BUTTON_CLICKED: {
      return state;
    }
    case MainActionType.DOT_BUTTON_CLICKED: {
      state = { ...state, selectedOperator: OperatorType.DOT };

      return state;
    }
    case MainActionType.EQUALS_BUTTON_CLICKED: {
      state = { ...state, current: state.result, selectedOperator: null };
      return state;
    }
  }
  return state;
};
