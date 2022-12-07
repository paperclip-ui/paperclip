import * as styles from "@paperclip-ui/designer/src/styles/context-menu.pc";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { isKeyComboDown } from "../../hooks/useHotkeys";
import { Portal } from "../Portal";

export type ContextMenuProps = {
  children: React.ReactElement;
  menu: () => React.ReactElement[];
};

export const ContextMenu = ({ children, menu }: ContextMenuProps) => {
  const setMenuRef = (element: HTMLElement) => {
    element?.focus();
  };
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

  const menuOptions = useMemo(() => {
    return menu();
  }, [!!anchorStyle]);

  const onMenuKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === "Escape") {
      setAnchorStyle(null);
    }
    console.log(event, menuOptions);

    for (const option of menuOptions) {
      if (
        option.props.keyCombo &&
        isKeyComboDown(option.props.keyCombo, event.nativeEvent)
      ) {
        console.log("COMBO!");
      }
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
        onContextMenu,
      })}
      <Portal>
        {anchorStyle && (
          <styles.ContextMenu
            ref={setMenuRef}
            style={anchorStyle}
            onKeyDown={onMenuKeyDown}
          >
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
};

export const ContextMenuItem = ({
  keyCombo,
  children,
}: ContextMenuItemProps) => {
  return (
    <styles.ContextMenuItem keyCommand={prettyKeyCombo(keyCombo)}>
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
