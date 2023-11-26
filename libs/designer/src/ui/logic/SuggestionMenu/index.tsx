import React, { useEffect, useMemo, useRef } from "react";
import * as styles from "./ui.pc";
import { Portal } from "../Portal";
import cx from "classnames";
import { usePositioner } from "../hooks/usePositioner";
import { noop } from "lodash";
import { useInlineMachine } from "@paperclip-ui/common";
import { reducer } from "./reducer";
import { getInitialState, isOpen as isOpen2 } from "./state";
import { Callbacks, suggestionMenuEngine } from "./engine";

export type SuggestionMenuProps = {
  open?: boolean;
  values: string[];
  children: React.ReactElement;
  style?: any;
  multi?: boolean;
  onSelect: (values: any[]) => void;
  menu: () => React.ReactElement[];
  onComplete?: () => void;
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
  onComplete = noop,
  onBlur: onBlur2 = noop,
  onSelect: onSelect2,
  menu,
}: SuggestionMenuProps) => {
  const callbacksRef = useRef<Callbacks>();
  callbacksRef.current = {
    onBlur: onBlur2,
    onComplete,
    onSelect: onSelect2,
  };

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

  const isOpen = isOpen2(state);

  useEffect(() => {
    dispatch({ type: "propsChanged", payload: statefulProps });
  }, [statefulProps]);

  const ref = useRef<HTMLDivElement>();

  const oldProps = children.props;

  const onFocus = (event) => {
    dispatch({ type: "focused" });
    if (oldProps.onFocus) {
      oldProps.onFocus(event);
    }
  };

  const onBlur = (event: React.FocusEvent | React.KeyboardEvent) => {
    dispatch({ type: "blurred" });

    if (oldProps.onBlur) {
      oldProps.onBlur(event);
    }
  };

  const onSelect = (value: any) => {
    dispatch({
      type: "selected",
      payload: value,
    });
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

  const firstSelectedIndex = menuOptions?.findIndex(
    (option) => option.props.selected
  );

  const menuOptionsLength = menuOptions?.length;

  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    const selectedValue =
      menuOptions?.[preselectedIndex]?.props.selectValue ||
      menuOptions?.[preselectedIndex]?.props.value;

    dispatch({
      type: "keyDown",
      payload: {
        key: event.key,
        menuLength: menuOptionsLength,
        selectedValue,
        firstSelectedIndex,
      },
    });

    if (oldProps.onKeyDown) {
      oldProps.onKeyDown(event);
    }
  };

  const onInputChange = (value: string) => {
    dispatch({ type: "inputChanged", payload: value });
    if (oldProps.onChange) {
      oldProps.onChange(value);
    }
  };

  const onClick = (event: React.MouseEvent<any>) => {
    dispatch({ type: "inputClicked" });
    if (oldProps.onClick) {
      oldProps.onClick(event);
    }
  };

  const { anchorRef, targetRef } = usePositioner();

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
      menuItemProps={{ onMouseDown: onSelect }}
      class={cx({ selected, preselected, checked })}

    >
      {children || value}
    </styles.SuggestionMenuItem>
  );
};
