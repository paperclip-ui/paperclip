import React from "react";
import * as styles from "../../styles/editor.pc";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./EditorPanels/RightSidebar";
import { LeftSidebar } from "./EditorPanels/LeftSidebar";
import { CenterPanels } from "./EditorPanels/Center";
import { ResourceModal } from "./ResourceModal";
import { useSelector } from "@paperclip-ui/common";
import { getCurrentFilePath } from "../../state";
import {
  ShortcutCommand,
  getGlobalShortcuts,
} from "../../domains/shortcuts/state";
import { MenuItemOption } from "../../modules/shortcuts/base";

export const Editor = () => {
  const currentFile = useSelector(getCurrentFilePath);
  const shortcuts = useSelector(getGlobalShortcuts);

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
          <styles.SplashInfo
            commands={
              <>
                {shortcuts
                  .filter((shortcut) =>
                    [
                      ShortcutCommand.CreateDesignFile,
                      ShortcutCommand.OpenCodeEditor,
                    ].includes((shortcut as MenuItemOption<any>).command)
                  )
                  .map((shortcut: MenuItemOption<any>) => (
                    <styles.SplashTip label={shortcut.label} />
                  ))}
              </>
            }
          />
        )}
      </styles.EditorPanels>
    </styles.Editor>
  );
};
