import React, { useEffect, useState } from "react";
import cx from "classnames";
import { DropdownMenuItem } from "./menu.pc";
import { EMPTY_ARRAY, memoize } from "tandem-common";
import { BaseDropdownProps, ElementProps } from "./view.pc";
import { PCVariable } from "@paperclip-lang/core";
import labeledInputController from "../../root/workspace/right-gutter/styles/pretty/panes/inputs/labeled-input-controller";

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

export default (Base: React.ComponentClass<BaseDropdownProps>) =>
  ({
    value,
    options = EMPTY_ARRAY,
    filterable,
    onMouseDown: onMouseDown2,
    onChange,
    onChangeComplete,
    ...rest
  }: Props) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<string | null>(null);

    const onMouseDown = (event) => {
      if (!open) {
        setOpen(true);
      }
      if (onMouseDown2) {
        onMouseDown2(event);
      }
    };

    const onFilterChange = (value) => {
      setFilter(value ? String(value).toLowerCase() : null);
    };

    const onItemClick = (item, event) => {
      setOpen(false);
      if (onChange) {
        onChange(item.value);
      }
      if (onChangeComplete) {
        onChangeComplete(item.value);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Enter") {
        setOpen(true);
      }
    };
    const onShouldClose = () => {
      setOpen(false);
    };

    useEffect(() => {
      setFilter(filter);
      setOpen(false);
    }, [value]);

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
                onClick={(event) => onItemClick(item, event)}
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
          onShouldClose,
        }}
        filterInputProps={{
          style: {
            display: showFilter ? "block" : "none",
          } as any,
          value: selectedItem && selectedItem.label,
          focus: showFilter,
          onChange: onFilterChange,
        }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        options={menuItems}
        labelProps={{
          style: {
            display: showFilter ? "none" : "block",
          },
          text: (selectedItem && selectedItem.label) || "--",
        }}
        onMouseDown={onMouseDown}
      />
    );
  };
