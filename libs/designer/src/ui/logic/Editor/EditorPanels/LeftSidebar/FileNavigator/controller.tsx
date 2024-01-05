import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
import cx from "classnames";
import * as ui from "../ui.pc";
import {
  isPaperclipFile,
  memoize,
  useDispatch,
  useSelector,
} from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { ContextMenu } from "@paperclip-ui/designer/src/ui/logic/ContextMenu";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { PlusButton } from "@paperclip-ui/designer/src/ui/etc.pc";
import {
  SuggestionMenu,
  SuggestionMenuItem,
} from "@paperclip-ui/designer/src/ui/logic/SuggestionMenu";
import { getFileShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";
import { useDrag, useDrop } from "react-dnd";
import {
  Resource,
  ResourceKind,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { NativeTypes } from "react-dnd-html5-backend";

export const FileNavigator = (Base: React.FC<BaseFileNavigatorProps>) =>
  function FileNavigator() {
    const state = useSelector(getEditorState);
    const dispatch = useDispatch<DesignerEvent>();
    const fileFilter = useSelector(getFileFilter);
    const focusOnFileFilter = useSelector(getFocusOnFileFilter);
    const currentFile = useSelector(getCurrentFilePath);

    const [preselectedResource, setPreselectedResource] =
      useState<Resource>(null);
    let resources = useSelector(getSearchedFiles);
    resources = useMemo(() => {
      return resources.filter(isOpenableFile).slice(0, 20);
    }, [resources]);

    const history = useHistory();

    useEffect(() => {
      setPreselectedResource(resources[0]);
    }, [resources]);

    const onFilter = (value: string) => {
      dispatch({ type: "ui/fileFilterChanged", payload: value });
    };

    const onFilteredFileOver = setPreselectedResource;

    const onFilterKeyDown = (event: React.KeyboardEvent<any>) => {
      if (event.key === "Enter" && preselectedResource) {
        history.redirect(getResourceRedirect(preselectedResource));
      } else if (event.key === "ArrowUp") {
        setPreselectedResource(
          resources[Math.max(resources.indexOf(preselectedResource) - 1, 0)]
        );
      } else if (event.key === "ArrowDown") {
        setPreselectedResource(
          resources[
            Math.min(
              resources.indexOf(preselectedResource) + 1,
              resources.length - 1
            )
          ]
        );
      }
    };

    // if (currentFile && isPaperclipFile(currentFile) && !focusOnFileFilter) {
    //   return null;
    // }

    return (
      <Base
        header={
          <>
            Resources
            <TextInput
              autoFocus={focusOnFileFilter}
              onChange={onFilter}
              onKeyDown={onFilterKeyDown}
              value={fileFilter}
              placeholder="Search..."
            />
            <AddFileButton />
          </>
        }
        layers={
          fileFilter ? (
            <ui.FilteredFiles
              resources={resources}
              onMouseOver={onFilteredFileOver}
              preselectedResource={preselectedResource}
            />
          ) : (
            state.projectDirectory?.items &&
            sortFsItems(state.projectDirectory.items).map((item) => {
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

const isOpenableFile = (resource: Resource) => {
  if (resource.kind === ResourceKind.File2) {
    return /\.(pc|svg|png)$/.test(resource.name);
  }

  // everything else is an entity
  return true;
};

type FilteredFilesProps = {
  resources: Resource[];
  onMouseOver: (path: Resource) => void;
  preselectedResource: Resource | null;
};

export const FilteredFiles =
  (Base: React.FC<BaseFilteredFileProps>) =>
  ({ resources, preselectedResource, onMouseOver }: FilteredFilesProps) => {
    const rootDir = useSelector(getSearchedFilesRoot);

    return (
      <Base>
        {resources.map((resource) => {
          return (
            <ui.FilteredFile
              key={resource.id}
              resource={resource}
              rootDir={rootDir}
              preselected={resource.id === preselectedResource?.id}
              onMouseOver={() => onMouseOver(resource)}
            />
          );
        })}
      </Base>
    );
  };

type FilteredFileProps = {
  resource: Resource;
  rootDir: string;
  preselected?: boolean;
  onMouseOver?: () => void;
};

const getResourceRedirect = (resource: Resource) => {
  if (resource.kind === ResourceKind.File2) {
    return routes.editor({ filePath: resource.id });
  } else {
    return routes.editor({
      filePath: resource.parentPath,
      nodeId: resource.id,
    });
  }
};

export const FilteredFile =
  (Base: React.FC<BaseFilteredFileProps>) =>
  ({ resource, rootDir, preselected, onMouseOver }: FilteredFileProps) => {
    const history = useHistory();
    const onClick = () => {
      history.redirect(getResourceRedirect(resource));
    };
    const ref = useRef<HTMLDivElement>();
    const setRef = (current: HTMLDivElement) => {
      ref.current = current;
      dragRef(current);
    };

    useEffect(() => {
      if (preselected) {
        ref.current?.scrollIntoView({
          block: "nearest",
        });
      }
    }, [preselected]);

    const [{ opacity }, dragRef] = useDrag(
      () => ({
        type: DNDKind.Resource,
        item: resource,
        collect: (monitor) => ({
          opacity: monitor.isDragging() ? 0.5 : 1,
          cursor: monitor.isDragging() ? "copy" : "initial",
        }),
      }),
      []
    );

    return (
      <Base
        ref={setRef}
        container={{
          onClick,
          onMouseOver,
        }}
        style={{ opacity }}
        class={cx({
          preselected,
          component: resource.kind === ResourceKind.Component,
          file: resource.kind === ResourceKind.File2,
          "atom-token": resource.kind === ResourceKind.Token,
          "composite-token": resource.kind === ResourceKind.StyleMixin,
        })}
        basename={resource.name}
        dirname={resource.parentPath.replace(rootDir, "")}
        dirTitle={basename}
      />
    );
  };

type FSItemProps = {
  item: FSItem;
  depth: number;
};

export const FSNavigatorItem = (Base: React.FC<BaseFSItemProps>) =>
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
        accept:
          item.kind === FSItemKind.Directory
            ? [DNDKind.File, NativeTypes.FILE]
            : [DNDKind.File, DNDKind.Node],
        drop(droppedItem: any, monitor) {
          if (
            monitor.getItemType() === DNDKind.File ||
            monitor.getItemType() === NativeTypes.FILE
          ) {
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
            ((monitor.getItemType() === DNDKind.File ||
              monitor.getItemType() === NativeTypes.FILE) &&
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

    const onContextMenuOpen = useCallback(() => {
      dispatch({ type: "ui/FileNavigatorContextMenuOpened", payload: item });
      setOpen(true);
    }, [item.path]);

    useEffect(() => {
      if (selected) {
        setTimeout(() => {
          headerRef.current?.scrollIntoView({
            block: "nearest",
          });
        }, 100);
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

    return (
      <ContextMenu menu={() => shortcuts} onOpen={onContextMenuOpen}>
        <div>
          <Base
            layerHeader={{
              container: null,
              ref: setHeader,
              style: { "--depth": depth, opacity },
              onClick: onClick,
            }}
            header={basename(item.path)}
            headerClass={cx({
              file: item.kind === FSItemKind.File,
              folder: item.kind === FSItemKind.Directory,
              container: item.kind === FSItemKind.Directory,
              showDropOver: isDraggingOver,
              open,
              selected,
            })}
          >
            {item.kind === FSItemKind.Directory && open
              ? sortFsItems(item.items).map((item) => {
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

const sortFsItems = memoize((items: FSItem[]) =>
  items
    .concat()

    // sort directories at top
    .sort((a, b) => {
      if (a.kind === b.kind) {
        return basename(a.path).toLowerCase().charAt(0) >
          basename(b.path).toLowerCase().charAt(0)
          ? 1
          : -1;
      }
      return a.kind === FSItemKind.Directory ? -1 : 1;
    })
);

const basename = memoize((path: string) => path.split("/").pop());
