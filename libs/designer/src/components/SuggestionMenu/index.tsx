import React, { useEffect, useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import { Portal } from "../Portal";
import cx from "classnames";
import { usePositioner } from "../hooks/usePositioner";
import { noop } from "lodash";

export type SelectDetails = {
  event: React.FocusEvent | React.MouseEvent | React.KeyboardEvent;
};

export type SuggestionMenuProps = {
  values: string[];
  children: React.ReactElement;
  style?: any;
  multi?: boolean;
  onSelect: (values: any[], details: SelectDetails) => void;
  onOtherSelect: (value: string, details: SelectDetails) => void;
  menu: () => React.ReactElement[];
};

export const SuggestionMenu = ({
  values,
  children,
  style,
  multi,
  onSelect: onSelect2,
  onOtherSelect: onOtherSave,
  menu,
}: SuggestionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedValue, setTypedValued] = useState(null);
  const [preselectedIndex, setPreselectedIndex] = useState(0);

  const oldProps = children.props;

  const onFocus = (event) => {
    setIsOpen(true);
    if (oldProps.onFocus) {
      oldProps.onFocus(event);
    }
  };

  const onBlur = (event: React.FocusEvent | React.KeyboardEvent) => {
    setIsOpen((open) => {
      if (open && typedValue != null) {
        onOtherSave(typedValue, { event });
      }
      return false;
    });
  };

  const onSelect = (value: any, details: SelectDetails) => {
    if (multi) {
      if (!values.includes(value)) {
        values = [...values, value];
      } else {
        values = values.filter((existing) => existing !== value);
      }
    } else {
      values = [value];
    }
    onSelect2(values, details);
    setIsOpen(false);
  };

  const menuOptions = isOpen
    ? menu()
        .filter(filterOption(typedValue))
        .map((child, i) => {
          return React.cloneElement(child, {
            selected: values.includes(child.props.value),
            preselected: i === preselectedIndex,
            onSelect: (event: React.MouseEvent) => {
              console.log("SELECT");

              child.props.value &&
                onSelect(child.props.selectValue || child.props.value, {
                  event,
                });
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
    if (event.key !== "Tab") {
      setIsOpen(true);
    }

    if (event.key === "ArrowDown") {
      if (isOpen) {
        setPreselectedIndex(
          Math.min(preselectedIndex + 1, menuOptionsLength - 1)
        );
      }
    } else if (event.key === "ArrowUp") {
      if (isOpen) {
        setPreselectedIndex(Math.max(preselectedIndex - 1, 0));
      }
    } else if (event.key === "Enter") {
      const value =
        menuOptions[preselectedIndex]?.props.selectValue ||
        menuOptions[preselectedIndex]?.props.value;
      if (value) {
        onSelect(value, { event });
      } else if (typedValue != null) {
        onOtherSave(typedValue, { event });
      }
      setIsOpen(false);
    } else if (event.key === "Tab") {
      onBlur(event);
      oldProps.onKeyDown?.(event);
    } else if (oldProps.onKeyDown) {
      oldProps.onKeyDown(event);
    }
  };

  const onInputChange = (value: string) => {
    setTypedValued(value);
  };

  const onClick = () => setIsOpen(true);

  useEffect(() => {
    if (!isOpen) {
      setTypedValued(null);
    }
  }, [isOpen, menuOptionsLength]);

  const { anchorRef, targetRef } = usePositioner();

  useEffect(() => {
    setPreselectedIndex(
      // SUBTRACT 1 so that the value is not preselected. Could be a header or 0
      selectedIndex === -1 ? firstOptionValueIndex - 1 : selectedIndex
    );
  }, [selectedIndex, firstOptionValueIndex]);

  return (
    <styles.SuggestionContainer
      input={React.cloneElement(children, {
        key: "input",
        onBlur,
        onFocus,
        onChange: onInputChange,
        onKeyDown,
        onClick,
      })}
      menu={
        isOpen && menuOptions.length ? (
          <div ref={anchorRef} key="menu">
            <Portal>
              <styles.SuggestionMenu ref={targetRef} style={style}>
                {menuOptions}
              </styles.SuggestionMenu>
            </Portal>
          </div>
        ) : null
      }
    />
  );
};

const filterOption = (value: string) => (child) => {
  if (child.props.filterText && value != null) {
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
  checked?: boolean;

  // the value to select if differs from "value"
  selectValue?: any;
  filterText?: string;
  onSelect?: () => void;
};
export const SuggestionMenuItem = ({
  children,
  value,
  selected,
  preselected,
  onSelect,
  checked,
}: SuggestionMenuItemProps) => {
  const ref = useRef<HTMLDivElement>();

  // TODO: scroll to
  useEffect(() => {
    if (ref.current && (selected || preselected)) {
      // timeout so that the menu is correctly positioned
      setTimeout(() => {
        ref.current?.scrollIntoView({
          block: "nearest",
        });
      });
    }
  }, [selected, preselected, ref.current]);

  return (
    <styles.SuggestionMenuItem
      ref={ref}
      class={cx({ selected, preselected, checked })}
      onMouseDown={onSelect}
    >
      {children || value}
    </styles.SuggestionMenuItem>
  );
};
