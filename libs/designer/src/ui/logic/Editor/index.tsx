import React from "react";
import * as styles from "../../editor.pc";
import { RightSidebar } from "./EditorPanels/RightSidebar";
import { LeftSidebar } from "./EditorPanels/LeftSidebar/ui.pc";
import { ResourceModal } from "./ResourceModal";
import { useSelector } from "@paperclip-ui/common";
import { getCurrentFilePath } from "../../../state";
import {
  ShortcutCommand,
  getGlobalShortcuts,
} from "../../../domains/shortcuts/state";
import { MenuItemOption } from "../../../modules/shortcuts/base";
import { prettyKeyCombo } from "../../../domains/ui/state";

export const Editor = (Base: React.FC<styles.BaseEditorProps>) => () => {
  const currentFile = useSelector(getCurrentFilePath);
  const shortcuts = useSelector(getGlobalShortcuts);

  return (
    <>
      <ResourceModal />
      <Base leftSidebarProps={{}} rightPanelProps={{}} showCanvas={currentFile != null} showSplash={currentFile == null} splashProps={{commands:
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
      }} />
    </>


  );
};
