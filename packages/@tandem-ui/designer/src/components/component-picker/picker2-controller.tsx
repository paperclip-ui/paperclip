import * as React from "react";
import * as ReactDOM from "react-dom";
import cx from "classnames";
import { Dispatch } from "redux";
import {
  BaseComponentPopdownPickerProps,
  ComponentPickerPopdownItem as BaseComponentPickerPopdownItem,
  BaseComponentPickerPopdownItemProps,
} from "./picker.pc";
import { PCComponent, DependencyGraph, getAllPCComponents } from "paperclip";
import { componentPickerItemClick } from "../../actions";
import scrollIntoView from "scroll-into-view-if-needed";

export type Props = {
  graph: DependencyGraph;
  dispatch: Dispatch<any>;
};

type State = {
  filter: string[];
  preselectIndex: number;
};

type ComponentPickerPopdownItemProps = {
  preselected: boolean;
} & BaseComponentPickerPopdownItemProps;

class ComponentPickerPopdownItem extends React.PureComponent<ComponentPickerPopdownItemProps> {
  componentDidUpdate(prevProps: ComponentPickerPopdownItemProps) {
    if (this.props.preselected && !prevProps.preselected) {
      scrollIntoView(ReactDOM.findDOMNode(this) as HTMLDivElement, {
        scrollMode: "if-needed",
      });
    }
  }
  render() {
    const { preselected, ...rest } = this.props;
    return (
      <BaseComponentPickerPopdownItem variant={cx({ preselected })} {...rest} />
    );
  }
}

export default (Base: React.ComponentClass<BaseComponentPopdownPickerProps>) =>
  class Picker2Controller extends React.PureComponent<Props, State> {
    state = {
      filter: [],
      preselectIndex: 0,
    };

    onFilterChange = (value) => {
      this.setState({
        ...this.state,
        preselectIndex: 0,
        filter: String(value || "")
          .toLowerCase()
          .trim()
          .split(/\s+/g),
      });
    };
    onClickComponent = (component) => {
      this.props.dispatch(componentPickerItemClick(component));
    };
    onFilterKeyDown = (event: React.KeyboardEvent<any>) => {
      let preselectIndex = this.state.preselectIndex;
      const filteredComponents = this.getFilteredComponents();

      if (event.key === "ArrowDown") {
        preselectIndex++;
      } else if (event.key === "ArrowUp") {
        preselectIndex--;
      } else if (event.key === "Enter") {
        this.props.dispatch(
          componentPickerItemClick(filteredComponents[preselectIndex])
        );
      }

      this.setState({
        ...this.state,
        preselectIndex: Math.max(
          0,
          Math.min(preselectIndex, filteredComponents.length - 1)
        ),
      });
    };
    getFilteredComponents() {
      const { graph } = this.props;
      const { filter } = this.state;
      const components = getAllPCComponents(graph);
      return components.filter((component) => {
        const label = (component.label || "").toLowerCase();
        for (const part of filter) {
          if (label.indexOf(part) === -1) {
            return false;
          }
        }

        return true;
      });
    }
    render() {
      const { onClickComponent, onFilterChange, onFilterKeyDown } = this;
      const { preselectIndex } = this.state;
      const items = this.getFilteredComponents().map((component, i) => {
        return (
          <ComponentPickerPopdownItem
            key={component.id}
            onClick={() => onClickComponent(component)}
            componentNameProps={{ text: component.label }}
            preselected={i === preselectIndex}
          />
        );
      });
      return (
        <Base
          {...this.props}
          variant={cx({
            noComponents: items.length === 0,
          })}
          filterProps={{
            focus: true,
            onChange: onFilterChange,
            onKeyDown: onFilterKeyDown,
          }}
          items={items}
        />
      );
    }
  };
