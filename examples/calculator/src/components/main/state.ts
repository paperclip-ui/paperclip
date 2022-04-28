export enum OperatorType {
  DIVIDE,
  MULTIPLY,
  MINUS,
  PLUS,
  DOT
}

export type State = {
  current: number;
  result: number;
  selectedOperator?: OperatorType;
};

export const setOperator = (operator: OperatorType, state: State) => ({
  ...state,
  selectedOperator: operator
});

export const addNumber = (number: number, state: State) => {
  let result = state.result;
  let current = number;
  switch (state.selectedOperator) {
    case OperatorType.DIVIDE: {
      result = result / current;
      break;
    }
    case OperatorType.MULTIPLY: {
      result = result * current;
      break;
    }
    case OperatorType.MINUS: {
      result = result - current;
      break;
    }
    case OperatorType.PLUS: {
      result = result + current;
      break;
    }
    default: {
      result = Number(String(result) + current);
      break;
    }
  }

  return {
    ...state,
    result,
    current,
    selectedOperator: null
  };
};
