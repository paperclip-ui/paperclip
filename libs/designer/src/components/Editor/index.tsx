import React from "react";
import * as styles from "../../ui/editor.pc";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./EditorPanels/RightSidebar";
import { LeftSidebar } from "./EditorPanels/LeftSidebar/ui.pc";
import { CenterPanels } from "./EditorPanels/Center";
import { ResourceModal } from "./ResourceModal";
import { useSelector } from "@paperclip-ui/common";
import { getCurrentFilePath } from "../../state";
import {
  ShortcutCommand,
  getGlobalShortcuts,
} from "../../domains/shortcuts/state";
import { MenuItemOption } from "../../modules/shortcuts/base";
import { prettyKeyCombo } from "../../domains/ui/state";

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
                      ShortcutCommand.SearchFiles,
                    ].includes((shortcut as MenuItemOption<any>).command)
                  )
                  .map((shortcut: MenuItemOption<any>) => (
                    <styles.SplashTip
                      label={shortcut.label}
                      shortcuts={shortcut.shortcut.map((key) => {
                        return (
                          <styles.ComboKey key={key}>
                            {prettyKeyCombo([key])}
                          </styles.ComboKey>
                        );
                      })}
                    />
                  ))}
              </>
            }
          />
        )}
      </styles.EditorPanels>
    </styles.Editor>
  );
};
