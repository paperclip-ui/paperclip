import React, { useEffect, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import { Portal } from "../Portal";
import cx from "classnames";

export type PopoverProps = {
  children: React.ReactElement;
  style?: any;
  menu: () => React.ReactElement[];
};

export const Popover = ({ children, style, menu }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");

  const oldProps = children.props;

  const onFocus = (event) => {
    setIsOpen(true);
    if (oldProps.onFocus) {
      oldProps.onFocus(event);
    }
  };
  const onBlur = (event) => {
    setIsOpen(false);
    if (oldProps.onBlur) {
      oldProps.onBlur(event);
    }
  };
  const onChange = (value: string) => {
    setValue(value);
    if (oldProps.onChange) {
      oldProps.onChange(value);
    }
  };

  const onKeyPress = (event: React.KeyboardEvent<any>) => {
    if (event.key === "Enter") {
      setIsOpen(false);
    }
    if (oldProps.onKeyPress) {
      oldProps.onKeyPress(event);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setValue("");
    }
  }, [isOpen]);

  return (
    <styles.PopoverContainer
      input={React.cloneElement(children, {
        onBlur,
        onFocus,
        onChange,
        onKeyPress,
      })}
      menu={
        isOpen && (
          <Portal>
            <styles.PopoverMenu style={style}>
              {menu()
                .filter(filterOption(value))
                .map((child) => {
                  return React.cloneElement(child, {
                    selected: child.props.value === value,
                    onMouseDown: () => {
                      child.props.value && onChange(child.props.value);
                      if (child.props.onMouseDown) {
                        child.props.onMouseDown();
                      }
                    },
                  });
                })}
            </styles.PopoverMenu>
          </Portal>
        )
      }
    />
  );
};

const filterOption = (value: string) => (child) => {
  if (child.props.filterText) {
    return child.props.filterText.toLowerCase().includes(value.toLowerCase());
  }

  return true;
};

export const PopoverMenuSection = styles.PopoverMenuSection;

export type PopoverMenuItemProps = {
  children?: any;
  selected?: boolean;
  value: string;
  filterText?: string;
  onMouseDown?: () => void;
};
export const PopoverMenuItem = ({
  children,
  value,
  filterText,
  selected,
  onMouseDown,
}: PopoverMenuItemProps) => (
  <styles.PopoverMenuItem class={cx({ selected })} onMouseDown={onMouseDown}>
    {children || value}
  </styles.PopoverMenuItem>
);
