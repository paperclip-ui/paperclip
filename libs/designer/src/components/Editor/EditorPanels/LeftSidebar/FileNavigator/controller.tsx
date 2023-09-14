import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  BaseFileNavigatorProps,
  BaseFilteredFileProps,
  BaseFSItemProps,
} from "../ui.pc";
import {
  DNDKind,
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
import * as ui from "../ui.pc";
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
import { getFileShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";
import { useDrag, useDrop } from "react-dnd";

export const FileNavigator = (Base: React.FC<BaseFileNavigatorProps>) =>
  function FileNavigator() {
    const state = useSelector(getEditorState);
    const dispatch = useDispatch<DesignerEvent>();
    const fileFilter = useSelector(getFileFilter);
    const focusOnFileFilter = useSelector(getFocusOnFileFilter);

    const onFilter = (value: string) => {
      dispatch({ type: "ui/fileFilterChanged", payload: value });
    };

    return (
      <Base
        header={
          <>
            Resources
            <TextInput
              autoFocus={focusOnFileFilter}
              onChange={onFilter}
              value={fileFilter}
              placeholder="search..."
            />
            <AddFileButton />
          </>
        }
        layers={
          fileFilter ? (
            <ui.FilteredFiles />
          ) : (
            state.projectDirectory?.items.map((item) => {
              return <ui.FSItem key={item.path} item={item} depth={1} />;
            })
          )
        }
      />
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

export const FilteredFiles = (Base: React.FC<BaseFilteredFileProps>) => () => {
  const paths = useSelector(getSearchedFiles);
  const rootDir = useSelector(getSearchedFilesRoot);

  return (
    <Base>
      {paths
        .filter(isOpenableFile)
        .slice(0, 20)
        .map((path) => {
          return <ui.FilteredFile key={path} path={path} rootDir={rootDir} />;
        })}
    </Base>
  );
};

type FilteredFileProps = {
  path: string;
  rootDir: string;
};

export const FilteredFile =
  (Base: React.FC<BaseFilteredFileProps>) =>
  ({ path, rootDir }: FilteredFileProps) => {
    const parts = path.split("/");
    const basename = parts.pop();
    const dirname = parts.join("/").replace(rootDir + "/", "");
    const history = useHistory();
    const onClick = () => {
      history.redirect(routes.editor({ filePath: path }));
    };
    return (
      <Base
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

export const FSItem = (Base: React.FC<BaseFSItemProps>) =>
  function FSItem({ depth, item }: FSItemProps) {
    if (!item) {
      return null;
    }

    const dispatch = useDispatch<DesignerEvent>();
    const currentFilePath = useSelector(getCurrentFilePath);
    const selectedFilePath = useSelector(getSelectedFilePath);
    const [open, setOpen] = useState(false);
    const selected = selectedFilePath === item.path;
    const headerRef = useRef<HTMLDivElement>(null);
    // const [isOver, setIsOver] = useState(false);;

    const [{ opacity }, dragRef] = useDrag(
      () => ({
        type: DNDKind.File,
        item,
        collect: (monitor) => ({
          opacity: monitor.isDragging() ? 0.5 : 1,
          cursor: monitor.isDragging() ? "copy" : "initial",
        }),
      }),
      []
    );

    const [{ isDraggingOver }, dropRef] = useDrop(
      {
        accept: [DNDKind.File, DNDKind.Node],
        // hover: (_, monitor) => {
        //   const offset = monitor.getClientOffset();
        //   const rect = headerRef.current?.getBoundingClientRect();

        //   if (offset && rect && monitor.isOver() && monitor.canDrop()) {
        //     setIsOver(true);
        //   } else {
        //     setIsOver(false);
        //   }
        // },
        drop(droppedItem: any, monitor) {
          if (monitor.getItemType() === DNDKind.File) {
            dispatch({
              type: "ui/FileNavigatorDroppedFile",
              payload: {
                directory: item.path,
                item: droppedItem,
              },
            });
          } else if (monitor.getItemType() === DNDKind.Node) {
            dispatch({
              type: "ui/FileNavigatorDroppedNode",
              payload: {
                filePath: item.path,
                droppedExprId: droppedItem.id,
              },
            });
          }
        },
        canDrop(_droppedItem: FSItem, monitor) {
          return (
            (monitor.getItemType() === DNDKind.File &&
              item.kind === FSItemKind.Directory) ||
            (monitor.getItemType() === DNDKind.Node &&
              item.kind === FSItemKind.File)
          );
        },
        collect(monitor) {
          return {
            isDraggingOver: monitor.isOver(),
          };
        },
      },
      [item]
    );

    const onClick = useCallback(() => {
      dispatch({ type: "ui/FileNavigatorItemClicked", payload: item });
      setOpen(!open);
    }, [open, item.path]);

    useEffect(() => {
      if (selected) {
        headerRef.current?.scrollIntoView({
          block: "nearest",
        });
      }
    }, [selected]);

    useEffect(() => {
      if (currentFilePath && currentFilePath.includes(item.path)) {
        setOpen(true);
      }
    }, [currentFilePath]);
    const shortcuts = useSelector(getFileShortcuts);

    const setHeader = (current) => {
      headerRef.current = current;
      dropRef(current);
      dragRef(current);
    };

    if (item.kind === FSItemKind.File && !isPaperclipFile(item.path)) {
      return null;
    }

    return (
      <ContextMenu menu={() => shortcuts}>
        <div>
          <Base
            layerHeaderProps={{
              containerProps: null,
              ref: setHeader,
              style: { "--depth": depth, opacity },
              onClick: onClick,
              class: classNames({
                file: item.kind === FSItemKind.File,
                folder: item.kind === FSItemKind.Directory,
                container: item.kind === FSItemKind.Directory,
                showDropOver: isDraggingOver,
                open,
                selected,
              }),
            }}
            header={dirname(item.path)}
          >
            {item.kind === FSItemKind.Directory && open
              ? item.items.map((item) => {
                  return (
                    <ui.FSItem key={item.path} item={item} depth={depth + 1} />
                  );
                })
              : null}
          </Base>
        </div>
      </ContextMenu>
    );
  };

const dirname = memoize((path: string) => path.split("/").pop());
