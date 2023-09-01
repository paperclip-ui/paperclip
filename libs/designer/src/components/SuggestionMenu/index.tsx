import React, {
  MutableRefObject,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import { Portal } from "../Portal";
import cx from "classnames";
import { usePositioner } from "../hooks/usePositioner";
import { noop, reduce } from "lodash";
import { useInlineMachine } from "@paperclip-ui/common";
import { reducer } from "./reducer";
import { State, getInitialState, getSelectedValues, isOpen } from "./state";
import { SuggestionMenuEvent } from "./events";
import { Callbacks, suggestionMenuEngine } from "./engine";

export type SuggestionMenuProps = {
  open?: boolean;
  values: string[];
  children: React.ReactElement;
  style?: any;
  multi?: boolean;
  onSelect: (values: any[]) => void;
  onOtherSelect: (value: string) => void;
  menu: () => React.ReactElement[];
  onClose?: () => void;
  onBlur?: () => void;
};

export type SuggestionMenuContainerProps = SuggestionMenuProps & {
  renderMenu: (
    menuOptions: React.ReactElement[],
    props: any
  ) => React.ReactElement;
};

export const useSuggestionMenu = ({
  open,
  values,
  children,
  style,
  multi,
  onClose = noop,
  onBlur: onBlur2 = noop,
  onSelect: onSelect2,
  onOtherSelect: onOtherSave,
  menu,
}: SuggestionMenuProps) => {
  const callbacks = useMemo(
    () => ({
      onBlur: onBlur2,
      onOtherSelect: onOtherSave,
      onClose,
      onSelect: onSelect2,
    }),
    [onBlur2, onOtherSave, onClose, onSelect2]
  );

  const callbacksRef = useRef<Callbacks>();
  callbacksRef.current = callbacks;

  const statefulProps = useMemo(
    () => ({
      open,
      multi,
      values,
    }),
    [open, multi, values]
  );

  const [state, dispatch] = useInlineMachine(
    reducer,
    suggestionMenuEngine(callbacksRef),
    getInitialState(statefulProps)
  );

  const { customValue, preselectedIndex } = state;

  useEffect(() => {
    dispatch({ type: "propsChanged", payload: statefulProps });
  }, [statefulProps]);

  const ref = useRef<HTMLDivElement>();

  // useEffect(() => {
  //   if (!internalIsOpen) {
  //     onClose();
  //   }
  // }, [internalIsOpen]);

  const oldProps = children.props;

  const onFocus = (event) => {
    dispatch({ type: "focused" });
    if (oldProps.onFocus) {
      oldProps.onFocus(event);
    }
  };

  const onBlur = (event: React.FocusEvent | React.KeyboardEvent) => {
    dispatch({ type: "blurred" });
    // setIsOpen((open) => {
    //   if (open && typedValue != null) {
    //     onOtherSave(typedValue, { event });
    //   }
    //   return false;
    // });
    // onBlur2();
  };

  const onSelect = (value: any) => {
    dispatch({
      type: "selected",
      payload: value,
    });

    // if (multi) {
    //   if (!values.includes(value)) {
    //     values = [...values, value];
    //   } else {
    //     values = values.filter((existing) => existing !== value);
    //   }
    // } else {
    //   values = [value];
    // }
    // onSelect2(values, details);
    // setIsOpen(false);
  };

  const menuOptions = isOpen
    ? menu()
        .filter(filterOption(customValue))
        .map((child, i) => {
          return React.cloneElement(child, {
            selected: values.includes(child.props.value),
            preselected: i === preselectedIndex,
            onSelect: (event: React.MouseEvent) => {
              // prevent blur mainly
              event.preventDefault();

              child.props.value &&
                onSelect(child.props.selectValue || child.props.value);
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
    const selectedValue =
      menuOptions?.[preselectedIndex]?.props.selectValue ||
      menuOptions?.[preselectedIndex]?.props.value;

    dispatch({
      type: "keyDown",
      payload: { key: event.key, menuLength: menuOptionsLength, selectedValue },
    });

    if (oldProps.onKeyDown) {
      oldProps.onKeyDown(event);
    }

    // if (event.key !== "Tab") {
    //   setIsOpen(true);
    // }

    // if (event.key === "ArrowDown") {
    //   if (isOpen) {
    //     setPreselectedIndex(
    //       Math.min(preselectedIndex + 1, menuOptionsLength - 1)
    //     );
    //   }
    // } else if (event.key === "ArrowUp") {
    //   if (isOpen) {
    //     setPreselectedIndex(Math.max(preselectedIndex - 1, 0));
    //   }
    // } else if (event.key === "Enter") {
    //   const value =
    //     menuOptions?.[preselectedIndex]?.props.selectValue ||
    //     menuOptions?.[preselectedIndex]?.props.value;

    //   if (value) {
    //     onSelect(value, { event });
    //   } else if (typedValue != null) {
    //     onOtherSave(typedValue, { event });
    //   }
    //   setIsOpen(false);
    // } else if (event.key === "Tab") {
    //   onBlur(event);
    //   oldProps.onKeyDown?.(event);
    // } else if (oldProps.onKeyDown) {
    //   oldProps.onKeyDown(event);
    // }
  };

  const onInputChange = (value: string) => {
    dispatch({ type: "inputChanged", payload: value });
    // setTypedValued(value);
  };

  const onClick = (event) => {
    // setIsOpen(true);
    dispatch({ type: "inputClicked" });
    if (oldProps.onClick) {
      oldProps.onClick(event);
    }
  };

  // useEffect(() => {
  //   if (!isOpen) {
  //     setTypedValued(null);
  //   }
  // }, [isOpen, menuOptionsLength]);

  const { anchorRef, targetRef } = usePositioner();

  // useEffect(() => {
  //   setPreselectedIndex(
  //     // SUBTRACT 1 so that the value is not preselected. Could be a header or 0
  //     selectedIndex === -1 ? firstOptionValueIndex - 1 : selectedIndex
  //   );
  // }, [selectedIndex, firstOptionValueIndex]);

  return {
    onBlur,
    onFocus,
    onInputChange,
    onKeyDown,
    onClick,
    ref,
    isOpen,
    menuOptions,
    anchorRef,
    targetRef,
    style,
  };
};

export const SuggestionMenuContainer = (
  props: SuggestionMenuContainerProps
) => {
  const { children, renderMenu } = props;
  const {
    onBlur,
    onFocus,
    onInputChange,
    onKeyDown,
    onClick,
    ref,
    isOpen,
    targetRef,
    menuOptions,
    anchorRef,
    style,
  } = useSuggestionMenu(props);

  return (
    <styles.SuggestionContainer
      ref={ref}
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
              {renderMenu(menuOptions, {
                ref: targetRef,
              })}
            </Portal>
          </div>
        ) : null
      }
    />
  );
};

export const SuggestionMenu = (props: SuggestionMenuProps) => {
  return (
    <SuggestionMenuContainer
      {...props}
      renderMenu={(options, props) => (
        <styles.SuggestionMenu {...props}>{options}</styles.SuggestionMenu>
      )}
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
