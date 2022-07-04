import {
  extendsComponent,
  getInspectorContentNode,
  getInspectorSourceNode,
  getPCNodeContentNode,
  getPCNodeModule,
  getSyntheticContentNode,
  getSyntheticInspectorNode,
  getSyntheticNodeById,
  getSyntheticVisibleNodeDocument,
  hasTextStyles,
  InspectorNode,
  inspectorNodeInShadow,
  PCSourceTagNames,
} from "@paperclip-lang/core";
import { Action } from "redux";
import {
  CanvasRightClicked,
  CANVAS_RIGHT_CLICKED,
  fileItemContextMenuCopyPathClicked,
  fileItemContextMenuCreateBlankFileClicked,
  fileItemContextMenuCreateComponentFileClicked,
  fileItemContextMenuCreateDirectoryClicked,
  fileItemContextMenuDeleteClicked,
  fileItemContextMenuOpenClicked,
  fileItemContextMenuRenameClicked,
  FileItemRightClicked,
  FILE_ITEM_RIGHT_CLICKED,
  inspectorNodeContextMenuConvertTextStylesToMixinClicked,
  inspectorNodeContextMenuConvertToComponentClicked,
  inspectorNodeContextMenuConvertToStyleMixinClicked,
  inspectorNodeContextMenuPasteClicked,
  inspectorNodeContextMenuRemoveClicked,
  inspectorNodeContextMenuRenameClicked,
  inspectorNodeContextMenuSelectParentClicked,
  inspectorNodeContextMenuSelectSourceNodeClicked,
  inspectorNodeContextMenuShowInCanvasClicked,
  inspectorNodeContextMenuWrapInElementClicked,
  inspectorNodeContextMenuWrapInSlotClicked,
  PCLayerRightClicked,
  PC_LAYER_RIGHT_CLICKED,
  ROOT_CLICKED,
} from "../../actions";
import {
  ContextMenuItem,
  ContextMenuOption,
  ContextMenuOptionType,
  getCanvasMouseTargetNodeId,
  RootState,
} from "../../state";
import { produce } from "immer";
import { FSItemTagNames, Point } from "tandem-common";

export const contextMenuReducer = (
  state: RootState,
  action: Action
): RootState => {
  switch (action.type) {
    case ROOT_CLICKED: {
      return produce(state, (newState) => {
        newState.contextMenu = null;
      });
    }
    case PC_LAYER_RIGHT_CLICKED: {
      const { item, point } = action as PCLayerRightClicked;
      return openNodeContextMenu(item, point, state);
    }
    case CANVAS_RIGHT_CLICKED: {
      const { point } = action as CanvasRightClicked;
      const targetNodeId = getCanvasMouseTargetNodeId(state, point);
      if (!targetNodeId) {
        return state;
      }

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

      state = openNodeContextMenu(inspectorNode, point, state);

      return state;
    }
    case FILE_ITEM_RIGHT_CLICKED: {
      const { item, point: anchor } = action as FileItemRightClicked;
      return produce(state, (newState) => {
        newState.contextMenu = {
          anchor,
          options: [
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
          ].filter(Boolean) as ContextMenuOption[],
        };
      });
    }
  }
  return state;
};

const openNodeContextMenu = (
  inspectorNode: InspectorNode,
  point: Point,
  state: RootState
) => {
  // const syntheticNode = getSyntheticNodeById(node.id, state.documents);
  const sourceNode = getInspectorSourceNode(
    inspectorNode,
    state.sourceNodeInspector,
    state.graph
  );
  const inspectorContentNode = getInspectorContentNode(
    inspectorNode,
    state.sourceNodeInspector
  );

  const contentNode = getPCNodeContentNode(
    sourceNode.id,
    getPCNodeModule(sourceNode.id, state.graph)
  );

  const inShadow = inspectorNodeInShadow(inspectorNode, inspectorContentNode);
  const showRenameLabelOption = true;

  state = produce(state, (newState) => {
    newState.contextMenu = {
      anchor: point,
      options: [
        inShadow
          ? {
              type: ContextMenuOptionType.ITEM,
              label: "Hide",
              action: inspectorNodeContextMenuRemoveClicked(inspectorNode),
            }
          : {
              type: ContextMenuOptionType.GROUP,
              options: [
                showRenameLabelOption
                  ? {
                      type: ContextMenuOptionType.ITEM,
                      label: "Rename",
                      action:
                        inspectorNodeContextMenuRenameClicked(inspectorNode),
                    }
                  : null,
                {
                  type: ContextMenuOptionType.ITEM,
                  label: "Remove",
                  action: inspectorNodeContextMenuRemoveClicked(inspectorNode),
                },
                sourceNode.name !== PCSourceTagNames.SLOT
                  ? {
                      type: ContextMenuOptionType.ITEM,
                      label: "Copy",
                      action:
                        inspectorNodeContextMenuConvertTextStylesToMixinClicked(
                          inspectorNode
                        ),
                    }
                  : null,
                {
                  type: ContextMenuOptionType.ITEM,
                  label: "Paste",
                  action: inspectorNodeContextMenuPasteClicked(inspectorNode),
                },
                sourceNode.name !== PCSourceTagNames.COMPONENT && !inShadow
                  ? {
                      type: ContextMenuOptionType.ITEM,
                      label: "Convert to Component",
                      action:
                        inspectorNodeContextMenuConvertToComponentClicked(
                          inspectorNode
                        ),
                    }
                  : null,

                sourceNode.name !== PCSourceTagNames.COMPONENT && !inShadow
                  ? {
                      type: ContextMenuOptionType.ITEM,
                      label: "Wrap in Element",
                      action:
                        inspectorNodeContextMenuWrapInElementClicked(
                          inspectorNode
                        ),
                    }
                  : null,
                contentNode.name === PCSourceTagNames.COMPONENT &&
                contentNode.id !== sourceNode.id &&
                !inShadow
                  ? {
                      type: ContextMenuOptionType.ITEM,
                      label: "Wrap in Slot",
                      action:
                        inspectorNodeContextMenuWrapInSlotClicked(
                          inspectorNode
                        ),
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
                          inspectorNode
                        ),
                    }
                  : null,

                (sourceNode.name === PCSourceTagNames.COMPONENT ||
                  sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
                  sourceNode.name === PCSourceTagNames.ELEMENT ||
                  sourceNode.name === PCSourceTagNames.TEXT) &&
                hasTextStyles(
                  inspectorNode,
                  state.sourceNodeInspector,
                  state.selectedVariant,
                  state.graph
                )
                  ? {
                      type: ContextMenuOptionType.ITEM,
                      label: "Move Text Styles to Mixin",
                      action:
                        inspectorNodeContextMenuConvertTextStylesToMixinClicked(
                          inspectorNode
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
                  action:
                    inspectorNodeContextMenuSelectParentClicked(inspectorNode),
                }
              : null,
            inShadow || extendsComponent(sourceNode)
              ? {
                  type: ContextMenuOptionType.ITEM,
                  label: "Go To Source",
                  action:
                    inspectorNodeContextMenuSelectSourceNodeClicked(
                      inspectorNode
                    ),
                }
              : null,
            {
              type: ContextMenuOptionType.ITEM,
              label: "Center in Canvas",
              action:
                inspectorNodeContextMenuShowInCanvasClicked(inspectorNode),
            },
          ].filter(Boolean) as ContextMenuItem[],
        },
      ].filter(Boolean) as ContextMenuOption[],
    };
  });
  return state;
};
