import React from "react";
import * as styles from "../../styles/editor.pc";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./EditorPanels/RightSidebar";
import { LeftSidebar } from "./EditorPanels/LeftSidebar";
import { CenterPanels } from "./EditorPanels/Center";
import { ResourceModal } from "./ResourceModal";

export const Editor = () => {
  return (
    <styles.Editor>
      <ResourceModal />
      <Canvas />
      <styles.EditorPanels>
        <LeftSidebar />
        <CenterPanels />
        <RightSidebar />
      </styles.EditorPanels>
    </styles.Editor>
  );
};
