import * as React from "react";
import { noop } from "lodash";
import * as cx from "classnames";
import { compose } from "recompose";
import { BaseAutoComleteTextInputProps } from "./view.pc";
import { withPureInputHandlers, WithInputHandlersProps } from "./controller";
import { DropdownMenuOption } from "../dropdown/controller";
import { DropdownMenuItem } from "../dropdown/menu.pc";
import { EMPTY_ARRAY } from "tandem-common";

export type Props = {
  value?: any;
  onChange?: any;
  onChangeComplete?: any;
  autoCompleteOptions: DropdownMenuOption[];
} & BaseAutoComleteTextInputProps;

export default compose(
  (Base: React.ComponentClass<BaseAutoComleteTextInputProps>) =>
    class AutoCompleteController extends React.PureComponent<Props> {
      state = {
        openPopover: false,
        value: this.props.value,
        prevValue: this.props.value
      };

      onShouldClosePopover = () => {
        this.setState({ ...this.state, openPopover: false });
      };
      onBlur = event => {
        this.setState({ ...this.state, openPopover: false });
        this.props.onBlur && this.props.onBlur(event);
      };
      onFocus = () => {
        this.setState({ ...this.state, openPopover: true });
      };
      componentWillUpdate(props, state) {
        if (props.value !== state.prevValue) {
          this.setState({ value: props.value, prevValue: props.value });
        }
      }
      onChange = value => {
        this.setState({ value, prevValue: this.props.value });
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      };
      render() {
        const {
          onKeyDown,
          autoCompleteOptions,
          onChangeComplete = noop,
          ...rest
        } = this.props;
        const { onShouldClosePopover, onFocus, onBlur, onChange } = this;
        const { openPopover, value } = this.state;
        const open = openPopover && !value;

        const menuItems = open
          ? autoCompleteOptions.map((option, i) => {
              return (
                <DropdownMenuItem
                  variant={cx({
                    alt: Boolean(i % 2),
                    special: option.special
                  })}
                  onClick={() => onChangeComplete(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              );
            })
          : EMPTY_ARRAY;

        return (
          <Base
            {...rest}
            textInputProps={{
              value,
              onFocus,
              onChange
            }}
            popoverProps={{
              open,
              onShouldClose: onShouldClosePopover
            }}
            menu={menuItems}
          />
        );
      }
    }
);
