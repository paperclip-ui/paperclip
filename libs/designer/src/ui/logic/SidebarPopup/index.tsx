import React, { useMemo, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import { Portal } from "../Portal";

type SidebarPopupProps = {
  children: any;
  header: any;
  onCloseClick: () => void;
};

export const SidebarPopup = ({
  children,
  header,
  onCloseClick,
}: SidebarPopupProps) => {
  const [anchor, setAnchor] = useState<HTMLDivElement>();
  const position = useMemo(() => anchor?.getBoundingClientRect(), [anchor]);

  const style: Record<string, number> = {
    left: position?.left,
    top: position?.top + getScrollTop(anchor),
  };

  return (
    <>
      <div ref={setAnchor} style={{ position: "fixed" }}></div>

      <Portal>
        <sidebarStyles.SidebarPopup
          style={style}
          header={header}
          onCloseClick={onCloseClick}
        >
          {children}
        </sidebarStyles.SidebarPopup>
      </Portal>
    </>
  );
};

const getScrollTop = (element: HTMLElement) => {
  let curr = element;
  let accum = 0;
  while (curr) {
    accum += curr.scrollTop;
    curr = curr.parentElement;
  }

  return accum;
};
