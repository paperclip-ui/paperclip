import React, { ReactChild, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import { Portal } from "../Portal";

export type PopoverProps = {
  value: string;
  children: React.ReactElement;
  menu: () => React.ReactElement[];
  onChange: (value: string) => void;
};

export const Popover = ({ children, onChange, menu }: PopoverProps) => {
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
  value: string;
  onMouseDown?: () => void;
};
export const PopoverMenuItem = ({
  children,
  value,
  onMouseDown,
}: PopoverMenuItemProps) => (
  <styles.PopoverMenuItem onMouseDown={onMouseDown}>
    {children || value}
  </styles.PopoverMenuItem>
);
