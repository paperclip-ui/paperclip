import {
  fork,
  put,
  take,
  call,
  spawn,
  takeEvery,
  select,
} from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { mapKeys } from "lodash";
import {
  FILE_ITEM_RIGHT_CLICKED,
  FileItemRightClicked,
  fileItemContextMenuDeleteClicked,
  fileItemContextMenuCopyPathClicked,
  fileItemContextMenuOpenClicked,
  fileItemContextMenuRenameClicked,
  CANVAS_RIGHT_CLICKED,
  PCLayerRightClicked,
  inspectorNodeContextMenuWrapInSlotClicked,
  inspectorNodeContextMenuSelectParentClicked,
  inspectorNodeContextMenuSelectSourceNodeClicked,
  inspectorNodeContextMenuConvertToComponentClicked,
  inspectorNodeContextMenuWrapInElementClicked,
  inspectorNodeContextMenuConvertToStyleMixinClicked,
  inspectorNodeContextMenuRemoveClicked,
  EDITOR_TAB_RIGHT_CLICKED,
  EditorTabClicked,
  inspectorNodeContextMenuConvertTextStylesToMixinClicked,
  inspectorNodeContextMenuRenameClicked,
  inspectorNodeContextMenuShowInCanvasClicked,
  moduleContextMenuCloseOptionClicked,
  PC_LAYER_RIGHT_CLICKED,
  editorTabContextMenuOpenInBottomTabOptionClicked,
  inspectorNodeContextMenuCopyClicked,
  inspectorNodeContextMenuPasteClicked,
  fileItemContextMenuCreateDirectoryClicked,
  fileItemContextMenuCreateBlankFileClicked,
  fileItemContextMenuCreateComponentFileClicked,
} from "../actions";
import {
  ContextMenuItem,
  ContextMenuOptionType,
  ContextMenuOption,
  RootState,
  getCanvasMouseTargetNodeIdFromPoint,
  getCanvasMouseTargetNodeId,
} from "../state";
import { Point, FSItemTagNames, EMPTY_OBJECT } from "tandem-common";
import {
  getSyntheticNodeById,
  getSyntheticSourceNode,
  PCSourceTagNames,
  getPCNodeContentNode,
  getSyntheticInspectorNode,
  getSyntheticVisibleNodeDocument,
  syntheticNodeIsInShadow,
  getPCNodeModule,
  SyntheticNode,
  getInspectorSyntheticNode,
  inspectorNodeInShadow,
  extendsComponent,
  hasTextStyles,
  getInspectorContentNode,
  SYNTHETIC_DOCUMENT_NODE_NAME,
  getSyntheticDocumentDependencyUri,
  SyntheticDocument,
  getInspectorSourceNode,
  InspectorTreeNodeName,
  getPCNode,
  InspectorNode,
} from "paperclip";

export type ShortcutSagaOptions = {
  openContextMenu: (anchor: Point, options: ContextMenuOption[]) => void;
};

type openInspectorNodeContextMenuOptions = {
  showRenameLabelOption?: boolean;
};

export const createShortcutSaga = ({
  openContextMenu,
}: ShortcutSagaOptions) => {
  return function* () {
    yield takeEvery(
      FILE_ITEM_RIGHT_CLICKED,
      function* handleFileItemRightClick({
        event,
        item,
      }: FileItemRightClicked) {
        yield call(
          openContextMenu,
          {
            left: event.pageX,
            top: event.pageY,
          },
          [
            {
              type: ContextMenuOptionType.GROUP,
              options: [
                {
                  type: ContextMenuOptionType.ITEM,
                  label: "Copy Path",
                  action: fileItemContextMenuCopyPathClicked(item),
                },
                {
                  type: ContextMenuOptionType.ITEM,
                  label:
                    item.name === FSItemTagNames.DIRECTORY
                      ? "Open in Finder"
                      : "Open in Text Editor",
                  action: fileItemContextMenuOpenClicked(item),
                },
              ] as ContextMenuItem[],
            },
            {
              type: ContextMenuOptionType.GROUP,
              options: [
                {
                  type: ContextMenuOptionType.ITEM,
                  label: "Rename",
                  action: fileItemContextMenuRenameClicked(item),
                },
                {
                  type: ContextMenuOptionType.ITEM,
                  label: "Delete",
                  action: fileItemContextMenuDeleteClicked(item),
                },
              ],
            },
            item.name === FSItemTagNames.DIRECTORY
              ? {
                  type: ContextMenuOptionType.GROUP,
                  options: [
                    {
                      type: ContextMenuOptionType.ITEM,
                      label: "Create Directory",
                      action: fileItemContextMenuCreateDirectoryClicked(item),
                    },
                    {
                      type: ContextMenuOptionType.ITEM,
                      label: "Create Blank File",
                      action: fileItemContextMenuCreateBlankFileClicked(item),
                    },
                    {
                      type: ContextMenuOptionType.ITEM,
                      label: "Create Component File",
                      action:
                        fileItemContextMenuCreateComponentFileClicked(item),
                    },
                  ],
                }
              : null,
          ].filter(Boolean) as ContextMenuOption[]
        );
      }
    );

    yield takeEvery(
      EDITOR_TAB_RIGHT_CLICKED,
      function* handleEditorRightClicked({ event, uri }: EditorTabClicked) {
        yield call(
          handleModuleRightClicked,
          {
            left: event.pageX,
            top: event.pageY,
          },
          uri
        );
      }
    );

    function* handleModuleRightClicked(point: Point, uri: string) {
      yield call(openContextMenu, point, [
        {
          type: ContextMenuOptionType.ITEM,
          label: "Close",
          action: moduleContextMenuCloseOptionClicked(uri),
        },
        {
          type: ContextMenuOptionType.ITEM,
          label: "Open in Bottom Tab",
          action: editorTabContextMenuOpenInBottomTabOptionClicked(uri),
        },
      ]);
    }

    yield takeEvery(
      CANVAS_RIGHT_CLICKED,
      function* handleFileItemRightClick({
        event,
        item,
      }: FileItemRightClicked) {
        const state: RootState = yield select();
        const targetNodeId = getCanvasMouseTargetNodeId(state, {
          left: event.pageX,
          top: event.pageY,
        });
        if (targetNodeId) {
          yield call(
            openCanvasSyntheticNodeContextMenu,
            targetNodeId,
            event,
            state
          );
        }
      }
    );

    function* openCanvasSyntheticNodeContextMenu(
      targetNodeId: string,
      event: React.MouseEvent<any>,
      state: RootState
    ) {
      const ownerWindow = (event.nativeEvent.target as HTMLDivElement)
        .ownerDocument.defaultView;
      const parent = ownerWindow.top;
      const ownerIframe = Array.from(
        parent.document.querySelectorAll("iframe")
      ).find((iframe: HTMLIFrameElement) => {
        return iframe.contentDocument === ownerWindow.document;
      });

      const rect = ownerIframe.getBoundingClientRect();

      const syntheticNode = getSyntheticNodeById(targetNodeId, state.documents);
      const document = getSyntheticVisibleNodeDocument(
        syntheticNode.id,
        state.documents
      );
      const inspectorNode = getSyntheticInspectorNode(
        syntheticNode,
        document,
        state.sourceNodeInspector,
        state.graph
      );

      yield call(
        openInspectorNodeContextMenu,
        inspectorNode,
        {
          left: event.pageX + rect.left,
          top: event.pageY + rect.top,
        },
        state
      );
    }

    yield takeEvery(
      PC_LAYER_RIGHT_CLICKED,
      function* handleFileItemRightClick({ event, item }: PCLayerRightClicked) {
        // this will happen for
        if (!item) {
          console.warn(
            `ModuleContextMenuOptionClicked dispatched without an inspectorNode`
          );
          return;
        }

        const state: RootState = yield select();
        // const node = getInspectorSyntheticNode(item, state.documents);
        // getInspectorSourceNode(item,

        if (item.name === InspectorTreeNodeName.SHADOW) {
          return;
        }

        yield call(
          openInspectorNodeContextMenu,
          item,
          {
            left: event.pageX,
            top: event.pageY,
          },
          state,
          { showRenameLabelOption: true }
        );
      }
    );

    function* openInspectorNodeContextMenu(
      node: InspectorNode,
      point: Point,
      state: RootState,
      {
        showRenameLabelOption,
      }: openInspectorNodeContextMenuOptions = EMPTY_OBJECT
    ) {
      // const syntheticNode = getSyntheticNodeById(node.id, state.documents);
      const sourceNode = getInspectorSourceNode(
        node,
        state.sourceNodeInspector,
        state.graph
      );
      const inspectorContentNode = getInspectorContentNode(
        node,
        state.sourceNodeInspector
      );

      const contentNode = getPCNodeContentNode(
        sourceNode.id,
        getPCNodeModule(sourceNode.id, state.graph)
      );

      const inShadow = inspectorNodeInShadow(node, inspectorContentNode);

      yield call(
        openContextMenu,
        point,
        [
          inShadow
            ? {
                type: ContextMenuOptionType.ITEM,
                label: "Hide",
                action: inspectorNodeContextMenuRemoveClicked(node),
              }
            : {
                type: ContextMenuOptionType.GROUP,
                options: [
                  showRenameLabelOption
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Rename",
                        action: inspectorNodeContextMenuRenameClicked(node),
                      }
                    : null,
                  {
                    type: ContextMenuOptionType.ITEM,
                    label: "Remove",
                    action: inspectorNodeContextMenuRemoveClicked(node),
                  },
                  sourceNode.name !== PCSourceTagNames.SLOT
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Copy",
                        action: inspectorNodeContextMenuCopyClicked(node),
                      }
                    : null,
                  {
                    type: ContextMenuOptionType.ITEM,
                    label: "Paste",
                    action: inspectorNodeContextMenuPasteClicked(node),
                  },
                  sourceNode.name !== PCSourceTagNames.COMPONENT && !inShadow
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Convert to Component",
                        action:
                          inspectorNodeContextMenuConvertToComponentClicked(
                            node
                          ),
                      }
                    : null,

                  sourceNode.name !== PCSourceTagNames.COMPONENT && !inShadow
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Wrap in Element",
                        action:
                          inspectorNodeContextMenuWrapInElementClicked(node),
                      }
                    : null,
                  contentNode.name === PCSourceTagNames.COMPONENT &&
                  contentNode.id !== sourceNode.id &&
                  !inShadow
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Wrap in Slot",
                        action: inspectorNodeContextMenuWrapInSlotClicked(node),
                      }
                    : null,

                  sourceNode.name === PCSourceTagNames.COMPONENT ||
                  sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
                  sourceNode.name === PCSourceTagNames.ELEMENT ||
                  sourceNode.name === PCSourceTagNames.TEXT
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Move All Styles to Mixin",
                        action:
                          inspectorNodeContextMenuConvertToStyleMixinClicked(
                            node
                          ),
                      }
                    : null,

                  (sourceNode.name === PCSourceTagNames.COMPONENT ||
                    sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
                    sourceNode.name === PCSourceTagNames.ELEMENT ||
                    sourceNode.name === PCSourceTagNames.TEXT) &&
                  hasTextStyles(
                    node,
                    state.sourceNodeInspector,
                    state.selectedVariant,
                    state.graph
                  )
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Move Text Styles to Mixin",
                        action:
                          inspectorNodeContextMenuConvertTextStylesToMixinClicked(
                            node
                          ),
                      }
                    : null,
                ].filter(Boolean) as ContextMenuItem[],
              },
          {
            type: ContextMenuOptionType.GROUP,
            options: [
              contentNode.id !== sourceNode.id
                ? {
                    type: ContextMenuOptionType.ITEM,
                    label: "Select Parent",
                    action: inspectorNodeContextMenuSelectParentClicked(node),
                  }
                : null,
              inShadow || extendsComponent(sourceNode)
                ? {
                    type: ContextMenuOptionType.ITEM,
                    label: "Select Source Layer",
                    action:
                      inspectorNodeContextMenuSelectSourceNodeClicked(node),
                  }
                : null,
              {
                type: ContextMenuOptionType.ITEM,
                label: "Center in Canvas",
                action: inspectorNodeContextMenuShowInCanvasClicked(node),
              },
            ].filter(Boolean) as ContextMenuItem[],
          },
        ].filter(Boolean) as ContextMenuOption[]
      );
    }
  };
};

export function* shortcutSaga() {
  // yield fork(handleFileItemRightClick);
  // yield fork(mapHotkeys({
  //   // artboard
  //   "a": wrapDispatch(SHORTCUT_A_KEY_DOWN),
  //   // rectangle
  //   "r": wrapDispatch(SHORTCUT_R_KEY_DOWN),
  //   // text
  //   "t": wrapDispatch(SHORTCUT_T_KEY_DOWN),
  //   // artboard
  //   "escape": wrapDispatch(SHORTCUT_ESCAPE_KEY_DOWN),
  //   // artboard
  //   "backspace": wrapDispatch(SHORTCUT_DELETE_KEY_DOWN)
  // }));
}

const wrapDispatch = (type: string) =>
  function* (sourceEvent) {
    // yield put(shortcutKeyDown(type));
  };

const mapHotkeys = (map: {
  [identifier: string]: (event: KeyboardEvent) => any;
}) =>
  function* () {
    const ordererdMap = mapKeys(map, (value: any, key: string) =>
      key.split(" ").sort().join(" ")
    );
    const keysDown: string[] = [];

    const chan = yield eventChannel((emit) => {
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (keysDown.indexOf(event.key) === -1) {
          keysDown.push(event.key);
        }
        const handler =
          ordererdMap[
            keysDown.join(" ").toLocaleLowerCase().split(" ").sort().join(" ")
          ];
        if (handler) {
          emit(call(handler, event));
        }
      });

      document.addEventListener("keyup", (event: KeyboardEvent) => {
        keysDown.splice(keysDown.indexOf(event.key), 1);
      });
      return () => {};
    });

    while (1) {
      const action = yield take(chan);
      yield spawn(function* () {
        yield action;
      });
    }
  };
