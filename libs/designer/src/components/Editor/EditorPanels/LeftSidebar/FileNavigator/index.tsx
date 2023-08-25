import React, { useCallback, useEffect, useRef, useState } from "react";

import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import {
  FSDirectory,
  FSFile,
  FSItem,
  FSItemKind,
  NewFileKind,
  getCurrentFilePath,
  getEditorState,
  getFileFilter,
  getFocusOnFileFilter,
  getSearchedFiles,
  getSearchedFilesRoot,
  getSelectedFilePath,
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
import { PlusButton } from "@paperclip-ui/designer/src/styles/etc.pc";
import {
  SuggestionMenu,
  SuggestionMenuItem,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import { noop } from "lodash";

export const FileNavigator = () => {
  const state = useSelector(getEditorState);
  const dispatch = useDispatch<DesignerEvent>();
  const fileFilter = useSelector(getFileFilter);
  const focusOnFileFilter = useSelector(getFocusOnFileFilter);

  const onFilter = (value: string) => {
    dispatch({ type: "ui/fileFilterChanged", payload: value });
  };

  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection class="fill">
        <sidebarStyles.SidebarPanelHeader>
          Resources
          <TextInput
            autoFocus={focusOnFileFilter}
            onChange={onFilter}
            value={fileFilter}
            placeholder="search..."
          />
          <AddFileButton />
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

export const AddFileButton = () => {
  const dispatch = useDispatch<DesignerEvent>();

  const onChange = (values: NewFileKind[]) => {
    dispatch({ type: "ui/AddFileItemClicked", payload: values[0] });
  };

  return (
    <SuggestionMenu
      values={[]}
      onSelect={onChange}
      onOtherSelect={noop}
      menu={() => [
        <SuggestionMenuItem value={NewFileKind.DesignFile}>
          Design file
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={NewFileKind.Directory}>
          Directory
        </SuggestionMenuItem>,
      ]}
    >
      <PlusButton />
    </SuggestionMenu>
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

type FSItemProps = {
  item: FSItem;
  depth: number;
};

const FSItem = ({ depth, item }: FSItemProps) => {
  const dispatch = useDispatch<DesignerEvent>();
  const currentFilePath = useSelector(getCurrentFilePath);
  const selectedFilePath = useSelector(getSelectedFilePath);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = selectedFilePath === item.path;

  const onClick = useCallback(() => {
    dispatch({ type: "ui/FileNavigatorItemClicked", payload: item });
    setOpen(!open);
  }, [open, item.path]);

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selected]);

  useEffect(() => {
    if (currentFilePath && currentFilePath.includes(item.path)) {
      setOpen(true);
    }
  }, [currentFilePath]);

  if (item.kind === FSItemKind.File && !isPaperclipFile(item.path)) {
    return null;
  }

  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        ref={ref}
        style={{ "--depth": depth }}
        onClick={onClick}
        class={classNames({
          file: item.kind === FSItemKind.File,
          folder: item.kind === FSItemKind.Directory,
          container: item.kind === FSItemKind.Directory,
          open,
          selected,
        })}
      >
        {dirname(item.path)}
      </styles.LayerNavigationItemHeader>
      {item.kind === FSItemKind.Directory && open
        ? item.items.map((item) => {
            return <FSItem key={item.path} item={item} depth={depth + 1} />;
          })
        : null}
    </styles.TreeNavigationItem>
  );
};

const dirname = memoize((path: string) => path.split("/").pop());
