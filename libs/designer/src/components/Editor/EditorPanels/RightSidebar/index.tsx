import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/right-sidebar.pc";
import { StylePanel } from "./StylePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { DesignerState, getSelectedId } from "@paperclip-ui/designer/src/state";
import { useSelector } from "@paperclip-ui/common";

export const RightSidebar = () => {
  const showUI = useSelector((state: DesignerState) => state.showRightsidebar);
  const targetId = useSelector(getSelectedId);
  if (!showUI) {
    return null;
  }

  return (
    <styles.RightSidebar>
      {targetId && <StylePanel />}
      <PropertiesPanel />
    </styles.RightSidebar>
  );
};
