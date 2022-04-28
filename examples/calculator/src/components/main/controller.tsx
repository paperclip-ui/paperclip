import * as React from "react";
import * as cx from "classnames";
import { BaseApplicationProps } from "./view.pc";
import { Action, MainActionType } from "./actions";
import { reducer } from "./reducer";
import { State, OperatorType } from "./state";

export type Props = {} & BaseApplicationProps;

export default (Base: React.ComponentClass<BaseApplicationProps>) =>
  class ApplicationController extends React.PureComponent<Props, State> {
    state: State = {
      result: 0,
      current: 0
    };

    dispatch = (action: Action) => {
      this.setState(reducer(this.state, action));
    };

    render() {
      const { dispatch } = this;
      const { current, selectedOperator } = this.state;
      const { ...rest } = this.props;

      return (
        <Base
          {...rest}
          resultProps={{
            text: String(current)
          }}
          clearButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.CLEAR_BUTTON_CLICKED })
          }}
          negateButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.TOGGLE_POSITIVE_BUTTON_CLICKED })
          }}
          decimalButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.DECIMAL_BUTTON_CLICKED })
          }}
          divideButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.DIVIDE_BUTTON_CLICKED }),
            variant: cx({
              operator: selectedOperator !== OperatorType.DIVIDE,
              selectedOperator: selectedOperator === OperatorType.DIVIDE
            })
          }}
          sevenButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.SEVEN_BUTTON_CLICKED })
          }}
          eightButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.EIGHT_BUTTON_CLICKED })
          }}
          nineButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.NINE_BUTTON_CLICKED })
          }}
          multiplyButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.MULTIPLY_BUTTON_CLICKED }),
            variant: cx({
              operator: selectedOperator !== OperatorType.MULTIPLY,
              selectedOperator: selectedOperator === OperatorType.MULTIPLY
            })
          }}
          fourButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.FOUR_BUTTON_CLICKED })
          }}
          fiveButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.FIVE_BUTTON_CLICKED })
          }}
          sixButtonProps={{
            onClick: () => dispatch({ type: MainActionType.SIX_BUTTON_CLICKED })
          }}
          minusButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.MINUS_BUTTON_CLICKED }),
            variant: cx({
              operator: selectedOperator !== OperatorType.MINUS,
              selectedOperator: selectedOperator === OperatorType.MINUS
            })
          }}
          oneButtonProps={{
            onClick: () => dispatch({ type: MainActionType.ONE_BUTTON_CLICKED })
          }}
          twoButtonProps={{
            onClick: () => dispatch({ type: MainActionType.TWO_BUTTON_CLICKED })
          }}
          threeButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.THREE_BUTTON_CLICKED })
          }}
          addButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.PLUS_BUTTON_CLICKED }),
            variant: cx({
              operator: selectedOperator !== OperatorType.PLUS,
              selectedOperator: selectedOperator === OperatorType.PLUS
            })
          }}
          zeroButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.ZERO_BUTTON_CLICKED })
          }}
          dotButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.DOT_BUTTON_CLICKED }),
            variant: cx({
              operator: selectedOperator !== OperatorType.DOT,
              selectedOperator: selectedOperator === OperatorType.DOT
            })
          }}
          equalsButtonProps={{
            onClick: () =>
              dispatch({ type: MainActionType.EQUALS_BUTTON_CLICKED }),
            variant: cx({
              operator: true
            })
          }}
        />
      );
    }
  };
