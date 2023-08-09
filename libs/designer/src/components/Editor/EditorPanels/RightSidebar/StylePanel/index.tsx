import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { Variants } from "./Variants";
import { Declarations } from "./Declarations";

export const StylePanel = () => {
  return (
    <sidebarStyles.SidebarPanel>
      <Variants />
      <Declarations />
    </sidebarStyles.SidebarPanel>
  );
};
