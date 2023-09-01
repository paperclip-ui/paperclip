import React, { useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import cx from "classnames";
import { startDOMDrag } from "../utils/dnd";
import { clamp } from "lodash";

type SidebarContainerProps = {
  children: any;
  position: "left" | "right";
};

export const SidebarContainer = ({
  children,
  position,
}: SidebarContainerProps) => {
  const [width, setWidth] = useState(300);

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
    <styles.SidebarContainer
      ref={ref}
      style={{ width }}
      onSidebarMouseDown={onSidebarMouseDown}
      class={cx({
        left: position === "left",
        right: position === "right",
      })}
    >
      {children}
    </styles.SidebarContainer>
  );
};
