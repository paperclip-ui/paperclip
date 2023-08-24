import React, { useCallback, useState } from "react";

import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import {
  FSDirectory,
  FSFile,
  FSItem,
  FSItemKind,
  getCurrentFilePath,
  getEditorState,
  getFileFilter,
  getSearchedFiles,
  getSearchedFilesRoot,
} from "@paperclip-ui/designer/src/state";
import classNames from "classnames";
import {
  isPaperclipFile,
  memoize,
  useDispatch,
  useSelector,
} from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { ContextMenu } from "@paperclip-ui/designer/src/components/ContextMenu";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import { routes } from "@paperclip-ui/designer/src/state/routes";

export const FileNavigator = () => {
  const state = useSelector(getEditorState);
  const dispatch = useDispatch<DesignerEvent>();
  const fileFilter = useSelector(getFileFilter);
  const onFilter = (value: string) => {
    dispatch({ type: "ui/fileFilterChanged", payload: value });
  };

  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection class="fill">
        <sidebarStyles.SidebarPanelHeader>
          Files
          <TextInput
            onChange={onFilter}
            value={fileFilter}
            placeholder="search..."
          />
          {/* <etc.PlusButton /> */}
        </sidebarStyles.SidebarPanelHeader>
        <styles.Layers>
          {fileFilter ? (
            <FilteredFiles />
          ) : (
            state.projectDirectory?.items.map((item) => {
              return <FSItem key={item.path} item={item} depth={1} />;
            })
          )}
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

const isOpenableFile = (path: string) => /\.pc$/.test(path);

const FilteredFiles = () => {
  const paths = useSelector(getSearchedFiles);
  const rootDir = useSelector(getSearchedFilesRoot);

  return (
    <styles.FilteredFiles>
      {paths
        .filter(isOpenableFile)
        .slice(0, 20)
        .map((path) => {
          return <FilteredFile key={path} path={path} rootDir={rootDir} />;
        })}
    </styles.FilteredFiles>
  );
};

type FilteredFileProps = {
  path: string;
  rootDir: string;
};

const FilteredFile = ({ path, rootDir }: FilteredFileProps) => {
  const parts = path.split("/");
  const basename = parts.pop();
  const dirname = parts.join("/").replace(rootDir + "/", "");
  const history = useHistory();
  const onClick = () => {
    history.redirect(routes.editor(path));
  };
  return (
    <styles.FilteredFile
      basename={basename}
      dirname={dirname}
      dirTitle={dirname}
      onClick={onClick}
    />
  );
};

const DirectoryItem = ({ item, depth }: FSItemProps<FSDirectory>) => {
  const dispatch = useDispatch<DesignerEvent>();

  const [open, setOpen] = useState(false);

  const onClick = useCallback(() => {
    if (!open) {
      dispatch({ type: "ui/FileNavigatorItemClicked", payload: item });
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [item.path, open]);

  const openContextMenu = useCallback(() => {
    return [];
  }, []);

  return (
    <styles.TreeNavigationItem>
      <ContextMenu menu={openContextMenu}>
        <styles.LayerNavigationItemHeader
          onClick={onClick}
          style={{ "--depth": depth }}
          class={classNames({
            folder: true,
            container: true,
            open,
          })}
        >
          {dirname(item.path)}
        </styles.LayerNavigationItemHeader>
      </ContextMenu>
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
