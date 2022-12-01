import React, { useEffect, useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import { Portal } from "../Portal";
import cx from "classnames";
import { usePositioner } from "../hooks/usePositioner";

export type SuggestionMenuProps = {
  value: string;
  children: React.ReactElement;
  style?: any;
  menu: () => React.ReactElement[];
};

export const SuggestionMenu = ({
  value,
  children,
  style,
  menu,
}: SuggestionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const [preselectedIndex, setPreselectedIndex] = useState(0);

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
    setInternalValue(value);
    if (oldProps.onChange) {
      oldProps.onChange(value);
    }
  };

  const menuOptions = isOpen
    ? menu()
        .filter(filterOption(internalValue))
        .map((child, i) => {
          return React.cloneElement(child, {
            selected: child.props.value === value,
            preselected: i === preselectedIndex,
            onMouseDown: () => {
              child.props.value && onChange(child.props.value);
              if (child.props.onMouseDown) {
                child.props.onMouseDown();
              }
            },
          });
        })
    : null;

  const selectedIndex = menuOptions?.findIndex(
    (option) => option.props.selected
  );
  const menuOptionsLength = menuOptions?.length;
  const firstOptionValueIndex = menuOptions?.findIndex(
    (child) => child.props.value != null
  );

  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === "ArrowDown") {
      if (isOpen) {
        setPreselectedIndex(
          Math.min(preselectedIndex + 1, menuOptionsLength - 1)
        );
      } else {
        setIsOpen(true);
      }
    }
    if (event.key === "ArrowUp") {
      if (isOpen) {
        setPreselectedIndex(Math.max(preselectedIndex - 1, 0));
      } else {
        setIsOpen(true);
      }
    }
    if (event.key === "Enter") {
      const preselectedValue = menuOptions[preselectedIndex]?.props.value;
      if (preselectedValue) {
        onChange(preselectedValue);
      }
      setIsOpen(false);
    }
    if (oldProps.onKeyDown) {
      oldProps.onKeyDown(event);
    }
  };

  const onClick = () => setIsOpen(true);

  useEffect(() => {
    if (!isOpen) {
      setInternalValue("");
    }
  }, [isOpen, menuOptionsLength]);

  const { anchorRef, targetRef } = usePositioner();

  useEffect(() => {
    if (typeof selectedIndex === "number") {
      setPreselectedIndex(
        selectedIndex === -1 ? firstOptionValueIndex : selectedIndex
      );
    }
  }, [selectedIndex, firstOptionValueIndex]);

  return (
    <styles.SuggestionContainer
      input={React.cloneElement(children, {
        onBlur,
        onFocus,
        onChange,
        onKeyDown,
        onClick,
      })}
      menu={
        isOpen && (
          <div ref={anchorRef}>
            <Portal>
              <styles.SuggestionMenu ref={targetRef} style={style}>
                {menuOptions}
              </styles.SuggestionMenu>
            </Portal>
          </div>
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

export const SuggestionMenuSection = styles.SuggestionMenuSection;

export type SuggestionMenuItemProps = {
  children?: any;
  selected?: boolean;
  preselected?: boolean;
  value: string;
  filterText?: string;
  onMouseDown?: () => void;
};
export const SuggestionMenuItem = ({
  children,
  value,
  selected,
  preselected,
  onMouseDown,
}: SuggestionMenuItemProps) => {
  const ref = useRef<HTMLDivElement>();

  // TODO: scroll to
  useEffect(() => {
    if (ref.current && (selected || preselected)) {
      // timeout so that the menu is correctly positioned
      setTimeout(() => {
        ref.current?.scrollIntoView(false);
      });
    }
  }, [selected, preselected, ref.current]);

  return (
    <styles.SuggestionMenuItem
      ref={ref}
      class={cx({ selected, preselected })}
      onMouseDown={onMouseDown}
    >
      {children || value}
    </styles.SuggestionMenuItem>
  );
};
