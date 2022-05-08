import { take, call, spawn, takeEvery, select } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { mapKeys } from "lodash";
import { FILE_ITEM_RIGHT_CLICKED, fileItemContextMenuDeleteClicked, fileItemContextMenuCopyPathClicked, fileItemContextMenuOpenClicked, fileItemContextMenuRenameClicked, CANVAS_RIGHT_CLICKED, inspectorNodeContextMenuWrapInSlotClicked, inspectorNodeContextMenuSelectParentClicked, inspectorNodeContextMenuSelectSourceNodeClicked, inspectorNodeContextMenuConvertToComponentClicked, inspectorNodeContextMenuWrapInElementClicked, inspectorNodeContextMenuConvertToStyleMixinClicked, inspectorNodeContextMenuRemoveClicked, EDITOR_TAB_RIGHT_CLICKED, inspectorNodeContextMenuConvertTextStylesToMixinClicked, inspectorNodeContextMenuRenameClicked, inspectorNodeContextMenuShowInCanvasClicked, moduleContextMenuCloseOptionClicked, PC_LAYER_RIGHT_CLICKED, editorTabContextMenuOpenInBottomTabOptionClicked, inspectorNodeContextMenuCopyClicked, inspectorNodeContextMenuPasteClicked, fileItemContextMenuCreateDirectoryClicked, fileItemContextMenuCreateBlankFileClicked, fileItemContextMenuCreateComponentFileClicked } from "../actions";
import { ContextMenuOptionType, getCanvasMouseTargetNodeId } from "../state";
import { FSItemTagNames, EMPTY_OBJECT } from "tandem-common";
import { getSyntheticNodeById, PCSourceTagNames, getPCNodeContentNode, getSyntheticInspectorNode, getSyntheticVisibleNodeDocument, getPCNodeModule, inspectorNodeInShadow, extendsComponent, hasTextStyles, getInspectorContentNode, getInspectorSourceNode, InspectorTreeNodeName } from "paperclip";
export const createShortcutSaga = ({ openContextMenu }) => {
    return function* () {
        yield takeEvery(FILE_ITEM_RIGHT_CLICKED, function* handleFileItemRightClick({ event, item }) {
            yield call(openContextMenu, {
                left: event.pageX,
                top: event.pageY
            }, [
                {
                    type: ContextMenuOptionType.GROUP,
                    options: [
                        {
                            type: ContextMenuOptionType.ITEM,
                            label: "Copy Path",
                            action: fileItemContextMenuCopyPathClicked(item)
                        },
                        {
                            type: ContextMenuOptionType.ITEM,
                            label: item.name === FSItemTagNames.DIRECTORY
                                ? "Open in Finder"
                                : "Open in Text Editor",
                            action: fileItemContextMenuOpenClicked(item)
                        }
                    ]
                },
                {
                    type: ContextMenuOptionType.GROUP,
                    options: [
                        {
                            type: ContextMenuOptionType.ITEM,
                            label: "Rename",
                            action: fileItemContextMenuRenameClicked(item)
                        },
                        {
                            type: ContextMenuOptionType.ITEM,
                            label: "Delete",
                            action: fileItemContextMenuDeleteClicked(item)
                        }
                    ]
                },
                item.name === FSItemTagNames.DIRECTORY
                    ? {
                        type: ContextMenuOptionType.GROUP,
                        options: [
                            {
                                type: ContextMenuOptionType.ITEM,
                                label: "Create Directory",
                                action: fileItemContextMenuCreateDirectoryClicked(item)
                            },
                            {
                                type: ContextMenuOptionType.ITEM,
                                label: "Create Blank File",
                                action: fileItemContextMenuCreateBlankFileClicked(item)
                            },
                            {
                                type: ContextMenuOptionType.ITEM,
                                label: "Create Component File",
                                action: fileItemContextMenuCreateComponentFileClicked(item)
                            }
                        ]
                    }
                    : null
            ].filter(Boolean));
        });
        yield takeEvery(EDITOR_TAB_RIGHT_CLICKED, function* handleEditorRightClicked({ event, uri }) {
            yield call(handleModuleRightClicked, {
                left: event.pageX,
                top: event.pageY
            }, uri);
        });
        function* handleModuleRightClicked(point, uri) {
            yield call(openContextMenu, point, [
                {
                    type: ContextMenuOptionType.ITEM,
                    label: "Close",
                    action: moduleContextMenuCloseOptionClicked(uri)
                },
                {
                    type: ContextMenuOptionType.ITEM,
                    label: "Open in Bottom Tab",
                    action: editorTabContextMenuOpenInBottomTabOptionClicked(uri)
                }
            ]);
        }
        yield takeEvery(CANVAS_RIGHT_CLICKED, function* handleFileItemRightClick({ event, item }) {
            const state = yield select();
            const targetNodeId = getCanvasMouseTargetNodeId(state, event);
            if (targetNodeId) {
                yield call(openCanvasSyntheticNodeContextMenu, targetNodeId, event, state);
            }
        });
        function* openCanvasSyntheticNodeContextMenu(targetNodeId, event, state) {
            const ownerWindow = event.nativeEvent.target
                .ownerDocument.defaultView;
            const parent = ownerWindow.top;
            const ownerIframe = Array.from(parent.document.querySelectorAll("iframe")).find((iframe) => {
                return iframe.contentDocument === ownerWindow.document;
            });
            const rect = ownerIframe.getBoundingClientRect();
            const syntheticNode = getSyntheticNodeById(targetNodeId, state.documents);
            const document = getSyntheticVisibleNodeDocument(syntheticNode.id, state.documents);
            const inspectorNode = getSyntheticInspectorNode(syntheticNode, document, state.sourceNodeInspector, state.graph);
            yield call(openInspectorNodeContextMenu, inspectorNode, {
                left: event.pageX + rect.left,
                top: event.pageY + rect.top
            }, state);
        }
        yield takeEvery(PC_LAYER_RIGHT_CLICKED, function* handleFileItemRightClick({ event, item }) {
            // this will happen for
            if (!item) {
                console.warn(`ModuleContextMenuOptionClicked dispatched without an inspectorNode`);
                return;
            }
            const state = yield select();
            // const node = getInspectorSyntheticNode(item, state.documents);
            // getInspectorSourceNode(item,
            if (item.name === InspectorTreeNodeName.SHADOW) {
                return;
            }
            yield call(openInspectorNodeContextMenu, item, {
                left: event.pageX,
                top: event.pageY
            }, state, { showRenameLabelOption: true });
        });
        function* openInspectorNodeContextMenu(node, point, state, { showRenameLabelOption } = EMPTY_OBJECT) {
            // const syntheticNode = getSyntheticNodeById(node.id, state.documents);
            const sourceNode = getInspectorSourceNode(node, state.sourceNodeInspector, state.graph);
            const inspectorContentNode = getInspectorContentNode(node, state.sourceNodeInspector);
            const contentNode = getPCNodeContentNode(sourceNode.id, getPCNodeModule(sourceNode.id, state.graph));
            const inShadow = inspectorNodeInShadow(node, inspectorContentNode);
            yield call(openContextMenu, point, [
                inShadow
                    ? {
                        type: ContextMenuOptionType.ITEM,
                        label: "Hide",
                        action: inspectorNodeContextMenuRemoveClicked(node)
                    }
                    : {
                        type: ContextMenuOptionType.GROUP,
                        options: [
                            showRenameLabelOption
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Rename",
                                    action: inspectorNodeContextMenuRenameClicked(node)
                                }
                                : null,
                            {
                                type: ContextMenuOptionType.ITEM,
                                label: "Remove",
                                action: inspectorNodeContextMenuRemoveClicked(node)
                            },
                            sourceNode.name !== PCSourceTagNames.SLOT
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Copy",
                                    action: inspectorNodeContextMenuCopyClicked(node)
                                }
                                : null,
                            {
                                type: ContextMenuOptionType.ITEM,
                                label: "Paste",
                                action: inspectorNodeContextMenuPasteClicked(node)
                            },
                            sourceNode.name !== PCSourceTagNames.COMPONENT && !inShadow
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Convert to Component",
                                    action: inspectorNodeContextMenuConvertToComponentClicked(node)
                                }
                                : null,
                            sourceNode.name !== PCSourceTagNames.COMPONENT && !inShadow
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Wrap in Element",
                                    action: inspectorNodeContextMenuWrapInElementClicked(node)
                                }
                                : null,
                            contentNode.name === PCSourceTagNames.COMPONENT &&
                                contentNode.id !== sourceNode.id &&
                                !inShadow
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Wrap in Slot",
                                    action: inspectorNodeContextMenuWrapInSlotClicked(node)
                                }
                                : null,
                            sourceNode.name === PCSourceTagNames.COMPONENT ||
                                sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
                                sourceNode.name === PCSourceTagNames.ELEMENT ||
                                sourceNode.name === PCSourceTagNames.TEXT
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Move All Styles to Mixin",
                                    action: inspectorNodeContextMenuConvertToStyleMixinClicked(node)
                                }
                                : null,
                            (sourceNode.name === PCSourceTagNames.COMPONENT ||
                                sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
                                sourceNode.name === PCSourceTagNames.ELEMENT ||
                                sourceNode.name === PCSourceTagNames.TEXT) &&
                                hasTextStyles(node, state.sourceNodeInspector, state.selectedVariant, state.graph)
                                ? {
                                    type: ContextMenuOptionType.ITEM,
                                    label: "Move Text Styles to Mixin",
                                    action: inspectorNodeContextMenuConvertTextStylesToMixinClicked(node)
                                }
                                : null
                        ].filter(Boolean)
                    },
                {
                    type: ContextMenuOptionType.GROUP,
                    options: [
                        contentNode.id !== sourceNode.id
                            ? {
                                type: ContextMenuOptionType.ITEM,
                                label: "Select Parent",
                                action: inspectorNodeContextMenuSelectParentClicked(node)
                            }
                            : null,
                        inShadow || extendsComponent(sourceNode)
                            ? {
                                type: ContextMenuOptionType.ITEM,
                                label: "Select Source Layer",
                                action: inspectorNodeContextMenuSelectSourceNodeClicked(node)
                            }
                            : null,
                        {
                            type: ContextMenuOptionType.ITEM,
                            label: "Center in Canvas",
                            action: inspectorNodeContextMenuShowInCanvasClicked(node)
                        }
                    ].filter(Boolean)
                }
            ].filter(Boolean));
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
const wrapDispatch = (type) => function* (sourceEvent) {
    // yield put(shortcutKeyDown(type));
};
const mapHotkeys = (map) => function* () {
    const ordererdMap = mapKeys(map, (value, key) => key
        .split(" ")
        .sort()
        .join(" "));
    const keysDown = [];
    const chan = yield eventChannel(emit => {
        document.addEventListener("keydown", (event) => {
            if (keysDown.indexOf(event.key) === -1) {
                keysDown.push(event.key);
            }
            const handler = ordererdMap[keysDown
                .join(" ")
                .toLocaleLowerCase()
                .split(" ")
                .sort()
                .join(" ")];
            if (handler) {
                emit(call(handler, event));
            }
        });
        document.addEventListener("keyup", (event) => {
            keysDown.splice(keysDown.indexOf(event.key), 1);
        });
        return () => { };
    });
    while (1) {
        const action = yield take(chan);
        yield spawn(function* () {
            yield action;
        });
    }
};
//# sourceMappingURL=shortcuts.js.map