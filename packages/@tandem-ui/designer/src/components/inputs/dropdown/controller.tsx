import * as React from "react";
import cx from "classnames";
import { DropdownMenuItem } from "./menu.pc";
import { EMPTY_ARRAY, memoize } from "tandem-common";
import { BaseDropdownProps, ElementProps } from "./view.pc";
import { PCVariable } from "paperclip";

export type DropdownMenuOption = {
  label: string;
  value: any;
  special?: boolean;
};

export const NO_OPTION: DropdownMenuOption = {
  label: "--",
  value: undefined,
};

export const dropdownMenuOptionFromValue = (
  value: string
): DropdownMenuOption => ({ label: value || "--", value });

export const mapVariablesToDropdownOptions = memoize(
  (variables: PCVariable[]): DropdownMenuOption[] => {
    return variables.map((variable) => ({
      value: variable,
      label: variable.label,
      special: true,
    }));
  }
);

export type Props = {
  value?: any;
  filterable?: boolean;
  options: DropdownMenuOption[];
  onChange?: (value: any) => any;
  onChangeComplete?: (value: any) => any;
} & ElementProps;

type DropdownState = {
  open: boolean;
  filter: string;
};

export default (Base: React.ComponentClass<BaseDropdownProps>) => {
  return class DropdownController extends React.PureComponent<
    Props,
    DropdownState
  > {
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        filter: null,
      };
    }
    onMouseDown = (event) => {
      // only open if _not_ opened yet. The popover will call onShouldClose if already open
      // since the button is technically out of the popover scope.
      if (!this.state.open) {
        this.setState({ ...this.state, open: true });
      }

      if (this.props.onMouseDown) {
        this.props.onMouseDown(event);
      }
    };
    onFilterChange = (value) => {
      this.setState({
        ...this.state,
        filter: value ? String(value).toLowerCase() : null,
      });
    };
    componentWillUpdate(props) {
      if (this.props.value !== props.value && this.state.filter) {
        this.setState({ ...this.state, filter: null, open: false });
      }
    }
    onItemClick = (item, event) => {
      const { onChange, onChangeComplete } = this.props;
      this.setState({ ...this.state, open: false });
      if (onChange) {
        onChange(item.value);
      }
      if (onChangeComplete) {
        onChangeComplete(item.value);
      }
    };
    onKeyDown = (event) => {
      if (event.key === "Enter") {
        this.setState({ ...this.state, open: true });
      }
    };
    onShouldClose = () => {
      this.setState({ ...this.state, open: false });
    };

    render() {
      const {
        value,
        options = EMPTY_ARRAY,
        filterable,
        onMouseDown,
        onChange,
        onChangeComplete,
        ...rest
      } = this.props;
      const { open, filter } = this.state;

      const menuItems = open
        ? options
            .filter(
              ({ label }) =>
                !filter || String(label).toLowerCase().indexOf(filter) !== -1
            )
            .map((item, i) => {
              return (
                <DropdownMenuItem
                  key={i}
                  variant={cx({
                    alt: Boolean(i % 2),
                    special: item.special,
                  })}
                  onClick={(event) => this.onItemClick(item, event)}
                >
                  {item.label}
                </DropdownMenuItem>
              );
            })
        : EMPTY_ARRAY;

      const selectedItem: DropdownMenuOption = options.find(
        (item) => item.value === value
      );
      const showFilter = open && filterable !== false;

      return (
        <Base
          {...rest}
          variant={cx({
            special: selectedItem && selectedItem.special,
          })}
          popoverProps={{
            open,
            onShouldClose: this.onShouldClose,
          }}
          filterInputProps={{
            style: {
              display: showFilter ? "block" : "none",
            } as any,
            value: selectedItem && selectedItem.label,
            focus: showFilter,
            onChange: this.onFilterChange,
          }}
          tabIndex={0}
          onKeyDown={this.onKeyDown}
          options={menuItems}
          labelProps={{
            style: {
              display: showFilter ? "none" : "block",
            },
            text: (selectedItem && selectedItem.label) || "--",
          }}
          onMouseDown={this.onMouseDown}
        />
      );
    }
  };
};
