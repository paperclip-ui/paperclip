import { useDispatch, useSelector } from "@paperclip-ui/common";
import * as styles from "./context-menu.pc";
import cx from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { ShortcutCommand } from "../../../domains/shortcuts/state";
import { DesignerEvent } from "../../../events";
import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../../modules/shortcuts/base";
import { Portal } from "../Portal";
import {  getHistoryStr } from "../../../state";
import { prettyKeyCombo } from "../../../domains/ui/state";
import { ContextMenuDivider, BaseContextMenuProps } from "./context-menu.pc";

export type ContextMenuProps = {
  children: React.ReactElement;
  menu: () => MenuItem<ShortcutCommand>[];
};

export const ContextMenu =
  (Base: React.FC<BaseContextMenuProps>) =>
  ({ children, menu }: ContextMenuProps) => {
    const otherRef = useRef<HTMLElement>();
    const ref = otherRef;
    const history = useSelector(getHistoryStr);

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

    // close context menu if history changes
    useEffect(() => {
      setAnchorStyle(null);
    }, [history]);

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

      document.body.addEventListener("click", onClick);

      return () => {
        document.body.removeEventListener("click", onClick);
      };
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
            <Base containerProps={{rootProps:{style: anchorStyle}}}>
              {menu().map((item) => {
                if (item.kind === MenuItemKind.Divider) {
                  return <ContextMenuDivider />;
                } else if (item.kind === MenuItemKind.Option) {
                  return <ContextMenuOption option={item} />;
                }
              })}
            </Base>
          )}
        </Portal>
      </>
    );
  };

type ContextMenuOptionProps = {
  option: MenuItemOption<ShortcutCommand>;
};

const ContextMenuOption = ({
  option: { shortcut, command, label, enabled },
}: ContextMenuOptionProps) => {
  const dispatch = useDispatch<DesignerEvent>();
  const onSelect = () => {
    dispatch({
      type: "shortcuts/itemSelected",
      payload: { command },
    });
  };
  return (
    <styles.ContextMenuItem
    containerProps={{
      class: cx({ disabled: enabled === false }),
      onClick: onSelect

    }}
      keyCommand={shortcut ? prettyKeyCombo(shortcut) : null}
    >
      {label}
    </styles.ContextMenuItem>
  );
};
