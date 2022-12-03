import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/right-sidebar.pc";
import { StylePanel } from "./StylePanel";
import { PropertiesPanel } from "./PropertiesPanel";

export const RightSidebar = () => {
  return (
    <styles.RightSidebar>
      <StylePanel />
      <PropertiesPanel />
    </styles.RightSidebar>
  );
};
