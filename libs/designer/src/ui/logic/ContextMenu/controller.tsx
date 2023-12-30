import { useDispatch, useSelector } from "@paperclip-ui/common";
import * as styles from "./context-menu.pc";
import cx from "classnames";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { ShortcutCommand } from "../../../domains/shortcuts/state";
import { DesignerEvent } from "../../../events";
import { clamp } from "lodash";
import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../../modules/shortcuts/base";
import { Portal } from "../Portal";
import { getHistoryStr } from "../../../state";
import { prettyKeyCombo } from "../../../domains/ui/state";
import { ContextMenuDivider, BaseContextMenuProps } from "./context-menu.pc";

export type ContextMenuProps = {
  children: React.ReactElement;
  menu: () => MenuItem<ShortcutCommand>[];
  onOpen?: () => void;
};

export const ContextMenu =
  (Base: React.FC<BaseContextMenuProps>) =>
  ({ children, menu, onOpen }: ContextMenuProps) => {
    const otherRef = useRef<HTMLElement>();
    const ref = otherRef;
    const history = useSelector(getHistoryStr);

    const [anchorPosition, setAnchorPosition] = useState<
      [number, number] | null
    >();
    const [menuRect, setMenuRect] = useState<{ width: number; height: number }>(
      { width: 0, height: 0 }
    );

    const anchorStyle = useMemo(() => {
      if (!anchorPosition) {
        return null;
      }

      return {
        position: "fixed",
        zIndex: 1024,
        left: clamp(anchorPosition[0], 0, window.innerWidth - menuRect.width),
        top: clamp(anchorPosition[1], 0, window.innerHeight - menuRect.height),
      };
    }, [anchorPosition, menuRect.width, menuRect.height]);

    const onContextMenu = (event: React.MouseEvent<any>) => {
      event.stopPropagation();
      event.preventDefault();
      setAnchorPosition([event.pageX, event.pageY]);
    };

    const setMenuRef = (current: HTMLDivElement) => {
      if (current) {
        setTimeout(() => {
          setMenuRect(current.getBoundingClientRect());
        });
      }
    };

    useEffect(() => {
      if (anchorStyle) {
        onOpen?.();
      }
    }, [anchorStyle]);

    const onTargetKeyDown = (event: React.KeyboardEvent<any>) => {
      if (children.props.onKeyDown) {
        children.props.onKeyDown(event);
      }

      if (event.key === "Escape") {
        setAnchorPosition(null);
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
        setAnchorPosition(null);
      };

      document.body.addEventListener("mousedown", onClick);

      return () => {
        document.body.removeEventListener("mousedown", onClick);
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
            <Base
              ref={setMenuRef}
              container={{ root: { style: anchorStyle as any } }}
            >
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
      container={{
        root: {
          className: cx({ disabled: enabled === false }),
          onMouseDown: onSelect,
        },
      }}
      keyCommand={shortcut ? prettyKeyCombo(shortcut) : null}
    >
      {label}
    </styles.ContextMenuItem>
  );
};
