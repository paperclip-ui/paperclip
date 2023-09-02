import React, { useMemo, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
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
    top: position?.top,
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
