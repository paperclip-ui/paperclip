import * as styles from "@paperclip-ui/designer/src/styles/context-menu.pc";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { isKeyComboDown } from "../../hooks/useHotkeys";
import { Portal } from "../Portal";

export type ContextMenuProps = {
  children: React.ReactElement;
  menu: React.ReactElement[];
};

export const ContextMenu = ({
  children,
  menu: menuOptions,
}: ContextMenuProps) => {
  const otherRef = useRef<HTMLElement>();
  const ref = children.props.ref || otherRef;

  const [anchorStyle, setAnchorStyle] = useState<any>(null);
  const onContextMenu = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorStyle({
      position: "fixed",
      zIndex: 1024,
      left: event.pageX,
      top: event.pageY,
    });
  };

  const onTargetKeyDown = (event: React.KeyboardEvent<any>) => {
    if (children.props.onKeyDown) {
      children.props.onKeyDown(event);
    }

    if (event.key === "Escape") {
      setAnchorStyle(null);
    }

    for (const option of menuOptions) {
      if (
        option.props.keyCombo &&
        isKeyComboDown(option.props.keyCombo, event.nativeEvent)
      ) {
        event.stopPropagation();
        event.preventDefault();
        option.props.onSelect();
      }
    }
  };

  const onTargetMouseDown = (event: React.MouseEvent<any>) => {
    ref.current.focus();
    if (children.props.onMouseDown) {
      children.props.onMouseDown(event);
    }
  };

  useEffect(() => {
    if (!anchorStyle) {
      return;
    }

    const onClick = () => {
      setAnchorStyle(null);
    };

    document.addEventListener("click", onClick);

    return () => document.removeEventListener("click", onClick);
  }, [anchorStyle]);

  return (
    <>
      {React.cloneElement(children, {
        ref,
        onMouseDown: onTargetMouseDown,
        onKeyDown: onTargetKeyDown,
        onContextMenu,
      })}
      <Portal>
        {anchorStyle && (
          <styles.ContextMenu style={anchorStyle}>
            {menuOptions}
          </styles.ContextMenu>
        )}
      </Portal>
    </>
  );
};

type ContextMenuItemProps = {
  keyCombo?: string;
  children: string;
  onSelect: () => void;
};

export const ContextMenuItem = ({
  keyCombo,
  children,
  onSelect,
}: ContextMenuItemProps) => {
  return (
    <styles.ContextMenuItem
      keyCommand={prettyKeyCombo(keyCombo)}
      onMouseDown={onSelect}
    >
      {children}
    </styles.ContextMenuItem>
  );
};

const prettyKeyCombo = (combo: string) => {
  return combo
    .replaceAll("+", "")
    .replace("meta", "⌘")
    .replace("delete", "⌫")
    .replace("alt", "⌥")
    .toUpperCase();
};

export const ContextMenuDivider = styles.ContextMenuDivider;
