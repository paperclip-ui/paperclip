import React, { useRef } from "react";
import * as styles from "./sidebar.pc";
import cx from "classnames";
import { startDOMDrag } from "../utils/dnd";
import { clamp } from "lodash";
import { useLocalState } from "../../hooks/useLocalState";

type SidebarContainerProps = {
  children?: any;
  position: "left" | "right";
};

export const SidebarContainer =
  (Base: React.FC<styles.BaseSidebarContainerProps>) =>
  ({ children, position }: SidebarContainerProps) => {
    const [width, setWidth] = useLocalState(`${position}Sidebar`, 300);

    const ref = useRef<HTMLDivElement>(null);
    const onSidebarMouseDown = (e: React.MouseEvent) => {
      startDOMDrag(e, null, (_event, data) => {
        const x = position === "left" ? data.delta.x : -data.delta.x;

        setWidth(clamp(width + x, 50, 700));
      });
    };

    if (children == null) {
      return null;
    }

    return (
      <Base
        ref={ref}
        style={{ width }}
        onSidebarMouseDown={onSidebarMouseDown}
        class={cx({
          left: position === "left",
          right: position === "right",
        })}
      >
        {children}
      </Base>
    );
  };
