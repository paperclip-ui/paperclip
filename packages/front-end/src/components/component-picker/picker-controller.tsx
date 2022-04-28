import * as React from "react";
import { Dispatch } from "redux";
import { RootState } from "../../state";
import { ComponentOption } from "./cell.pc";
import { getAllPCComponents } from "paperclip";
import { componentPickerItemClick } from "../../actions";
import { BasePickerProps } from "./picker.pc";

export type Props = {
  root: RootState;
  dispatch: Dispatch<any>;
};

type State = {
  filter: string[];
};

export default (Base: React.ComponentClass<BasePickerProps>) => {
  return class PickerController extends React.PureComponent<Props, State> {
    state = {
      filter: []
    };
    onFilterChange = value => {
      this.setState({
        ...this.state,
        filter: String(value || "")
          .toLowerCase()
          .trim()
          .split(/\s+/g)
      });
    };
    onClickComponent = component => {
      this.props.dispatch(componentPickerItemClick(component));
    };
    render() {
      const { onFilterChange, onClickComponent } = this;
      const { filter } = this.state;
      const { root } = this.props;

      const componentNodes = getAllPCComponents(root.graph);

      // TODO - filter private
      const options = componentNodes
        .filter(component => {
          const label = (component.label || "").toLowerCase();
          for (const part of filter) {
            if (label.indexOf(part) === -1) {
              return false;
            }
          }

          return true;
        })
        .map(component => {
          return (
            <ComponentOption
              key={component.id}
              onClick={() => onClickComponent(component)}
              centerProps={{ children: component.label }}
            />
          );
        });

      return (
        <Base
          filterInputProps={{
            onChange: onFilterChange
          }}
          optionsProps={{ children: options }}
        />
      );
    }
  };
};
