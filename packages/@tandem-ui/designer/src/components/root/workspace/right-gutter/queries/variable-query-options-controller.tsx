import * as React from "react";
import { Dispatch } from "redux";
import { BaseVariableQueryOptionsProps } from "./view.pc";
import {
  PCVariable,
  PCVariableQuery,
  PCVariableQueryCondition,
  PCQueryType,
} from "paperclip";
import {
  variableQuerySourceVariableChange,
  queryConditionChanged,
} from "../../../../../actions";
import { EMPTY_OBJECT, memoize } from "tandem-common";
import { DropdownMenuOption } from "../../../../inputs/dropdown/controller";
export type Props = {
  query: PCVariableQuery;
  globalVariables: PCVariable[];
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseVariableQueryOptionsProps>) =>
  class VariableQueryOptionsController extends React.PureComponent<Props> {
    onSourceVariableChange = (value: PCVariable) => {
      this.props.dispatch(
        variableQuerySourceVariableChange(this.props.query, value)
      );
    };
    onEqualsChange = (value: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.query, {
          ...(this.props.query.condition || EMPTY_OBJECT),
          equals: value,
        } as PCVariableQueryCondition)
      );
    };
    onNotEqualsChange = (value: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.query, {
          ...(this.props.query.condition || EMPTY_OBJECT),
          notEquals: value,
        } as PCVariableQueryCondition)
      );
    };
    render() {
      const { onSourceVariableChange, onEqualsChange, onNotEqualsChange } =
        this;
      const { query, globalVariables, ...rest } = this.props;

      if (query.type !== PCQueryType.VARIABLE) {
        return null;
      }

      return (
        <Base
          {...rest}
          variableInputProps={{
            filterable: true,
            value: globalVariables.find(
              (variable) => variable.id === query.sourceVariableId
            ),
            options: getVariableDropdownOptions(globalVariables),
            onChangeComplete: onSourceVariableChange,
          }}
          equalsInputProps={{
            value: query.condition && query.condition.equals,
            onChangeComplete: onEqualsChange,
          }}
          notEqualsInputProps={{
            value: query.condition && query.condition.notEquals,
            onChangeComplete: onNotEqualsChange,
          }}
        />
      );
    }
  };

const getVariableDropdownOptions = memoize(
  (variables: PCVariable[]): DropdownMenuOption[] => {
    return variables.map((variable) => {
      return {
        label: variable.label,
        value: variable,
      };
    });
  }
);
