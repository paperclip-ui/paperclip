import { useDispatch } from "@paperclip-ui/common";
import * as styles from "@paperclip-ui/designer/src/styles/context-menu.pc";
import React, { useEffect, useRef, useState } from "react";
import { DesignerEvent } from "../../events";
import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../modules/shortcuts/base";
import { Portal } from "../Portal";

export type ContextMenuProps = {
  children: React.ReactElement;
  menu: MenuItem<DesignerEvent>[];
};

export const ContextMenu = ({ children, menu }: ContextMenuProps) => {
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
            {menu.map((item) => {
              if (item.kind === MenuItemKind.Divider) {
                return <ContextMenuDivider />;
              } else if (item.kind === MenuItemKind.Option) {
                return <ContextMenuOption option={item} />;
              }
            })}
          </styles.ContextMenu>
        )}
      </Portal>
    </>
  );
};

type ContextMenuOptionProps = {
  option: MenuItemOption<DesignerEvent>;
};

const ContextMenuOption = ({
  option: { shortcut, event, label },
}: ContextMenuOptionProps) => {
  const dispatch = useDispatch();
  const onSelect = () => {
    dispatch(event);
  };
  return (
    <styles.ContextMenuItem
      keyCommand={shortcut ?? prettyKeyCombo(shortcut)}
      onMouseDown={onSelect}
    >
      {label}
    </styles.ContextMenuItem>
  );
};

const prettyKeyCombo = (combo: string[]) => {
  return combo
    .join("+")
    .replace("meta", "⌘")
    .replace("delete", "⌫")
    .replace("alt", "⌥")
    .replaceAll("+", "")
    .toUpperCase();
};

const ContextMenuDivider = styles.ContextMenuDivider;
