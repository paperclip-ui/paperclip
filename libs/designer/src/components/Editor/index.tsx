import React from "react";
import * as styles from "../../styles/editor.pc";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./EditorPanels/RightSidebar";
import { LeftSidebar } from "./EditorPanels/LeftSidebar";
import { CenterPanels } from "./EditorPanels/Center";
import { ResourceModal } from "./ResourceModal";
import { useSelector } from "@paperclip-ui/common";
import { getCurrentFilePath } from "../../state";

export const Editor = () => {
  const currentFile = useSelector(getCurrentFilePath);

  return (
    <styles.Editor>
      <ResourceModal />
      <Canvas />
      <styles.EditorPanels>
        <LeftSidebar />
        {currentFile ? (
          <>
            <CenterPanels />
            <RightSidebar />
          </>
        ) : (
          <styles.SplashInfo />
        )}
      </styles.EditorPanels>
    </styles.Editor>
  );
};
