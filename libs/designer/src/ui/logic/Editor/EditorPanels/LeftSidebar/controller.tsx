import React from "react";
import { BaseLeftSidebarProps } from "./ui.pc";
import { useSelector } from "@paperclip-ui/common";
import { DesignerState } from "@paperclip-ui/designer/src/state";

export const LeftSidebar = (Base: React.FC<BaseLeftSidebarProps>) => () => {
  const { show } = useLeftSidebar();

  if (!show) {
    return null;
  }
  return <Base fileNavigator={null} layers={null} />
};

const useLeftSidebar = () => {
  const show = useSelector((state: DesignerState) => state.showLeftSidebar);

  return {
    show,
  };
};
