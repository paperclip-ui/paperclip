import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import { useSelector } from "@paperclip-ui/common";
import { EditorState } from "@paperclip-ui/designer/src/machine/state";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";

export const LeftSidebar = () => {
  return (
    <styles.LeftSidebar>
      <styles.LeftSidebarHeader title="TODO" />
    </styles.LeftSidebar>
  );
};

const useLeftSidebar = () => {
  const history = useSelector(getHistoryState);
};
