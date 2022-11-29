import React, { ReactChild, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import { Portal } from "../Portal";
import { getValueByPointer } from "fast-json-patch";
import cx from "classnames";

export type PopoverProps = {
  value: string;
  children: React.ReactElement;
  menu: () => React.ReactElement[];
  onChange: (value: string) => void;
};

export const Popover = ({ value, children, onChange, menu }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onFocus = () => setIsOpen(true);
  const onBlur = () => setIsOpen(false);

  return (
    <styles.PopoverContainer
      input={React.cloneElement(children, {
        onBlur,
        onFocus,
      })}
      menu={
        isOpen && (
          <Portal>
            <styles.PopoverMenu>
              {menu().map((child) => {
                return React.cloneElement(child, {
                  selected: child.props.value === value,
                  onMouseDown: () => {
                    child.props.value && onChange(child.props.value);
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

export const PopoverMenuSection = styles.PopoverMenuSection;

export type PopoverMenuItemProps = {
  children?: any;
  selected?: boolean;
  value: string;
  onMouseDown?: () => void;
};
export const PopoverMenuItem = ({
  children,
  value,
  selected,
  onMouseDown,
}: PopoverMenuItemProps) => (
  <styles.PopoverMenuItem class={cx({ selected })} onMouseDown={onMouseDown}>
    {children || value}
  </styles.PopoverMenuItem>
);
