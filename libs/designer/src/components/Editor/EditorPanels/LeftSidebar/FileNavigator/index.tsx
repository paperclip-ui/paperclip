import React, { useCallback, useState } from "react";

import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as etc from "@paperclip-ui/designer/src/styles/etc.pc";
import {
  FSDirectory,
  FSFile,
  FSItem,
  FSItemKind,
  getCurrentFilePath,
  getEditorState,
} from "@paperclip-ui/designer/src/state";
import classNames from "classnames";
import {
  isPaperclipFile,
  memoize,
  useDispatch,
  useSelector,
} from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

export const FileNavigator = () => {
  const state = useSelector(getEditorState);

  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelHeader>
          Files
          {/* <etc.PlusButton /> */}
        </sidebarStyles.SidebarPanelHeader>
        <styles.Layers>
          {state.projectDirectory?.items.map((item) => {
            return <FSItem key={item.path} item={item} depth={1} />;
          })}
        </styles.Layers>
      </sidebarStyles.SidebarSection>
    </sidebarStyles.SidebarPanel>
  );
};

type FSItemProps<Item extends FSItem> = {
  item: Item;
  depth: number;
};

const FSItem = ({ item, depth }: FSItemProps<FSItem>) => {
  return item.kind === FSItemKind.Directory ? (
    <DirectoryItem item={item} depth={depth} />
  ) : (
    <FileItem item={item} depth={depth} />
  );
};

const DirectoryItem = ({ item, depth }: FSItemProps<FSDirectory>) => {
  const dispatch = useDispatch<DesignerEvent>();

  const onClick = useCallback(
    () => dispatch({ type: "ui/FileNavigatorItemClicked", payload: item }),
    [item.path]
  );

  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        onClick={onClick}
        style={{ "--depth": depth }}
        class={classNames({
          folder: true,
          container: true,
          open: false,
        })}
      >
        {dirname(item.path)}
      </styles.LayerNavigationItemHeader>
      <styles.TreeNavigationItemContent>
        {item.items.map((item) => {
          return <FSItem key={item.path} item={item} depth={depth + 1} />;
        })}
      </styles.TreeNavigationItemContent>
    </styles.TreeNavigationItem>
  );
};

const FileItem = ({ item, depth }: FSItemProps<FSFile>) => {
  // only show files that can be opened up in the designer.
  // TODO: need to have a toggle for this
  if (!isPaperclipFile(item.path)) {
    return null;
  }
  const state = useSelector(getEditorState);
  const dispatch = useDispatch<DesignerEvent>();
  const currentFilePath = useSelector(getCurrentFilePath);
  const onClick = useCallback(
    () => dispatch({ type: "ui/FileNavigatorItemClicked", payload: item }),
    [item.path]
  );

  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        style={{ "--depth": depth }}
        onClick={onClick}
        class={classNames({
          file: true,
          selected: currentFilePath === item.path,
        })}
      >
        {dirname(item.path)}
      </styles.LayerNavigationItemHeader>
    </styles.TreeNavigationItem>
  );
};

const dirname = memoize((path: string) => path.split("/").pop());
