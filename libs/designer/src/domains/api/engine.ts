import {
  DesignServerEvent,
  ModulesEvaluated,
  FileChanged,
  FileChangedKind,
  ResourceKind,
  Resource,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch, isPaperclipFile } from "@paperclip-ui/common";
import { Point } from "../../state/geom";
import { DesignerEngineEvent } from "./events";
import { DesignerEvent } from "../../events";
import {
  AddLayerMenuItemClicked,
  AtomValueChangeCompleted,
  AttributeChanged,
  ConfirmClosed,
  ElementTagChanged,
  ExprNavigatorDroppedNode,
  FileNavigatorDroppedNode,
  FileFilterChanged,
  FileNavigatorDroppedFile,
  InstanceVariantToggled,
  PromptClosed,
  StyleDeclarationsChangeCompleted,
  StyleMixinsSet,
  TextValueChanged,
  ToolsLayerDrop,
  VariantEdited,
  TriggersEdited,
  ScriptSaved,
  ScriptRemoved,
  MetaClickScript,
} from "../ui/events";

import {
  ConvertToComponentDetails,
  ConvertToSlotDetails,
  DEFAULT_FRAME_BOX,
  DesignerState,
  DNDKind,
  findVirtNode,
  FSItem,
  FSItemKind,
  getActiveFilePath,
  getCurrentFilePath,
  getFileFilter,
  getInsertBox,
  getNodeInfoAtCurrentPoint,
  getRenderedFilePath,
  getTargetExprId,
  InsertMode,
  LayerKind,
  PromptKind,
} from "../../state";
import {
  Mutation,
  NodePosition,
} from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { virtHTML } from "@paperclip-ui/core/lib/proto/virt/html-utils";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import {
  Element as VirtElement,
  TextNode as VirtTextNode,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { Box, getScaledBox, getScaledPoint, roundBox } from "../../state/geom";
import {
  getCurrentDependency,
  getSelectedExpression,
  getSelectedExpressionInfo,
  getSelectedVariantIds,
  getStyleableTargetId,
} from "../../state/pc";
import {
  getGlobalShortcuts,
  getKeyboardMenuCommand,
  ShortcutCommand,
} from "../shortcuts/state";
import { HistoryChanged } from "../history/events";
import { KeyDown } from "../keyboard/events";
import {
  DashboardAddFileConfirmed,
  IDChanged,
  ToolsTextEditorChanged,
} from "../ui/events";
import { ExpressionPasted } from "../clipboard/events";
import { Range } from "@paperclip-ui/proto/lib/generated/ast/base";
import { ConfirmKind } from "../../state/confirm";
import { metadataValueMapToJSON } from "@paperclip-ui/proto/lib/virt/html-utils";
import { NativeTypes } from "react-dnd-html5-backend";
import { serializeDeclaration } from "@paperclip-ui/core/lib/proto/ast/serialize";
import { isImageAsset } from "../ui/state";
import { APIActions } from "../../api";

export const createDesignerEngine =
  (actions: APIActions) =>
  (
    _dispatch: Dispatch<DesignerEvent>,
    getState: () => DesignerState
  ): Engine<DesignerState, DesignerEngineEvent> => {
    const handleEvent = createEventHandler(actions);
    bootstrap(actions, getState());

    const dispose = () => {};
    return {
      handleEvent,
      dispose,
    };
  };

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: APIActions) => {
  const handleInsert = async (state: DesignerState) => {
    let bounds = roundBox(
      getScaledBox(getInsertBox(state), state.canvas.transform)
    );

    bounds = roundBox(bounds);

    bounds = {
      ...bounds,
      width: bounds.width || DEFAULT_FRAME_BOX.width,
      height: bounds.height || DEFAULT_FRAME_BOX.height,
    };

    const insertMode = state.insertMode;

    const intersectingNode = getNodeInfoAtCurrentPoint(state);

    if (!intersectingNode) {
      const mutation: Mutation = {
        appendChild: {
          parentId: state.currentDocument.paperclip.html.sourceId,
          childSource: `
            /**
             * @frame(width: ${bounds.width}, height: ${bounds.height}, x: ${
            bounds.x
          }, y: ${bounds.y})
             */
             ${
               {
                 [InsertMode.Element]: `div {
                 style {
                   position: relative
                   background: blue
                 }
               }`,
                 [InsertMode.Text]: `text ""`,
               }[insertMode]
             }
          `,
        },
      };

      actions.applyChanges([mutation]);
    } else {
      const childSource = {
        [InsertMode.Element]: `div {
        }`,
        [InsertMode.Text]: `text "type to insert"`,
      }[insertMode];

      const exprInfo = ast.getExprByVirtId(
        intersectingNode.nodeId,
        state.graph
      );

      if (exprInfo?.kind === ast.ExprKind.Slot) {
        const targetExpr = await resolveTargetExprId(
          intersectingNode.nodeId,
          state
        );

        actions.applyChanges([
          {
            appendChild: {
              parentId: targetExpr.id,
              childSource,
            },
          },
        ]);
      } else {
        const parent = findVirtNode(intersectingNode.nodeId, state);

        const parentBox = state.rects[intersectingNode.nodeId];

        bounds = roundBox({
          ...bounds,
          x: bounds.x - parentBox.x,
          y: bounds.y - parentBox.y,
        });

        actions.applyChanges([
          {
            appendChild: {
              parentId: parent.sourceId,
              childSource,
            },
          },
        ]);
      }
    }
  };

  const handleCanvasMouseUp = (
    state: DesignerState,
    prevState: DesignerState
  ) => {
    if (prevState.insertMode != null) {
      return handleInsert(prevState);
    }
  };

  const handleMetaClickScript = (
    event: MetaClickScript,
    state: DesignerState
  ) => {
    const relativePath = event.payload.parameters.find(
      (param) => param.name === "src"
    ).value.str.value;
    const currentDesignFile = getCurrentFilePath(state);
    const fullPath =
      relativePath.charAt(0) === "."
        ? dirname(currentDesignFile) + "/" + relativePath
        : state.projectDirectory.path + "/" + relativePath;
    actions.openCodeEditor(fullPath);
  };

  const handleDeleteKeyPressed = (
    state: DesignerState,
    prevState: DesignerState
  ) => {
    handleDeleteExpression(getTargetExprId(prevState), state);
  };

  const handleFrameBoundsChanged = (
    state: DesignerState,
    bounds: Box,
    prevState: DesignerState
  ) => {
    const node = findVirtNode(getTargetExprId(prevState), prevState) as
      | VirtTextNode
      | VirtElement;

    const mutation: Mutation = {
      setFrameBounds: {
        frameId: node.sourceId,
        bounds,
      },
    };

    actions.applyChanges([mutation]);
  };

  const handleResizerStoppedMoving = (
    state: DesignerState,
    prevState: DesignerState
  ) => {
    const targetId = getStyleableTargetId(prevState);

    const node = findVirtNode(targetId, prevState) as
      | VirtTextNode
      | VirtElement;

    const variantIds = getSelectedVariantIds(state);

    const path = virtHTML.getNodePath(
      node,
      prevState.currentDocument.paperclip.html
    );

    if (path.includes(".")) {
      actions.applyChanges([
        {
          setStyleDeclarations: {
            variantIds,
            expressionId: node.sourceId,
            declarations: Object.entries(
              state.styleOverrides[getStyleableTargetId(prevState)]
            ).map(([name, value]) => {
              return { name, value: String(value) };
            }),
          },
        },
      ]);
    } else {
      const newBounds = metadataValueMapToJSON(node.metadata).frame;

      const mutation: Mutation = {
        setFrameBounds: {
          frameId: node.sourceId,
          bounds: newBounds,
        },
      };
      actions.applyChanges([mutation]);
    }
  };

  const handleExprNavigatorDroppedNode = async (
    event: ExprNavigatorDroppedNode,
    state: DesignerState
  ) => {
    const { targetId, item, position } = event.payload;

    const resolvedTarget = await resolveTargetExprId(targetId, state);
    if (item.kind === DNDKind.Node) {
      await actions.applyChanges([
        {
          moveNode: {
            targetId: resolvedTarget.id,
            nodeId: item.item.id,
            position: {
              before: NodePosition.BEFORE,
              after: NodePosition.AFTER,
              inside: NodePosition.INSIDE,
            }[position],
          },
        },
      ]);
    } else if (item.kind === DNDKind.Resource) {
      if (item.item.kind === ResourceKind.File2) {
        await insertResource(
          item.item.parentPath + "/" + item.item.name,
          resolvedTarget.id,
          null,
          state
        );
      } else if (item.item.kind === ResourceKind.Component) {
        await actions.applyChanges([
          {
            appendChild: {
              parentId: targetId,
              childSource: `
              import "${item.item.parentPath}" as module
              module.${item.item.name}
              `,
            },
          },
        ]);
      }
    } else if (item.kind === DNDKind.File) {
      await insertResource(item.item.path, resolvedTarget.id, null, state);
    } else if (item.kind === NativeTypes.FILE) {
      await insertFiles(item.item.files, resolvedTarget.id, null, state);
    }
  };

  const handleStyleDeclarationChanged = (
    event: StyleDeclarationsChangeCompleted,
    state: DesignerState
  ) => {
    const style = Object.entries(event.payload.values).map(([name, value]) => ({
      name,
      imports: event.payload.imports,
      value,
    }));
    const variantIds = getSelectedVariantIds(state);

    actions.applyChanges([
      {
        setStyleDeclarations: {
          variantIds,
          expressionId: getStyleableTargetId(state),
          declarations: style,
        },
      },
    ]);
  };

  const handleUndo = () => actions.undo();
  const handleRedo = () => actions.redo();
  const handleSave = () => actions.save();

  const handlePasteExpression = (
    event: ExpressionPasted,
    state: DesignerState
  ) => {
    const { data, type } = event.payload;

    let targetExpressionId = getTargetExprId(state);

    if (type === ShortcutCommand.Copy || type === ShortcutCommand.Cut) {
      if (!targetExpressionId) {
        targetExpressionId = state.currentDocument.paperclip.html.sourceId;
      }

      // TODO: need to check when user selects leaf in left sidebar, then need to use
      // that state to insert INTO the element instead of adjacent to it. This is an
      // incomplete solution necessary for cases like: copy -> paste -> paste -> paste
      targetExpressionId =
        ast.getParent(targetExpressionId, state.graph)?.id ||
        targetExpressionId;

      if (type === ShortcutCommand.Copy) {
        actions.applyChanges([
          {
            appendChild: {
              parentId: targetExpressionId,
              childSource: data,
            },
          },
        ]);
      } else {
        actions.applyChanges([
          {
            moveExpressionToFile: {
              newFilePath: getCurrentFilePath(state),
              expressionId: data,
            },
          },
        ]);
      }
    } else if (type === ShortcutCommand.CopyStyles) {
      actions.applyChanges([
        {
          setStyleDeclarations: {
            expressionId: getStyleableTargetId(state),
            declarations: data.propertyNames.map((name) => {
              return {
                name,
                value: serializeDeclaration(data.map[name].value),
              };
            }),
          },
        },
      ]);
    }
  };

  type ResolveTargetExprInfo = {
    kind: ast.ExprKind;
    id: string;
  };

  // for cases where virtual node is selected but doesn't exist. E.g: instance inserts
  const resolveTargetExprId = async (
    id: string,
    state: DesignerState
  ): Promise<ResolveTargetExprInfo> => {
    if (!id.includes(".")) {
      const info = ast.getExprInfoById(id, state.graph);
      return { kind: info.kind, id };
    }
    const instanceParts = id.split(".");

    const targetExpr = ast.getExprInfoById(instanceParts.pop(), state.graph);

    if (targetExpr.kind === ast.ExprKind.Slot) {
      const instanceExpr = ast.getExprInfoById(
        instanceParts.pop(),
        state.graph
      );

      if (instanceExpr.kind === ast.ExprKind.Element) {
        // children slot provided? Then return the instance
        if (targetExpr.expr.name === "children") {
          return { kind: targetExpr.kind, id: instanceExpr.expr.id };
        }

        // Otherwise find an insert to use
        const targetInsert = instanceExpr.expr.body.find((child) => {
          return child.insert?.name === targetExpr.expr.name;
        });

        // target expr already exists? Send it!
        if (targetInsert) {
          return {
            kind: ast.ExprKind.Insert,
            id: targetInsert.insert.id,
          };
        }

        // No insert found? No problem! Create one!
        const result = await actions.applyChanges([
          {
            appendChild: {
              parentId: instanceExpr.expr.id,
              childSource: `
              insert ${targetExpr.expr.name} {

              }
              `,
            },
          },
        ]);

        const targetId = result.changes.find((change) => {
          return change.expressionInserted;
        }).expressionInserted.id;

        return { kind: ast.ExprKind.Insert, id: targetId };
      }
    }

    throw new Error(`Cannot resolve expression`);
  };

  const handleAddLayerMenuItemClick = async (
    { payload: layerKind }: AddLayerMenuItemClicked,
    state: DesignerState
  ) => {
    const source = {
      [LayerKind.Atom]: `public token unnamed unset`,
      [LayerKind.Component]: `public component unnamed {}`,
      [LayerKind.Element]: `div`,
      [LayerKind.Text]: `text "double click to edit"`,
      [LayerKind.Style]: `public style unnamed {}`,
      [LayerKind.Trigger]: `public trigger unnamed {}`,
    }[layerKind];

    if (!source) {
      return;
    }

    // start with document for safety. Some exprs cannot be added
    // to parent els
    let parentId = getCurrentDependency(state).document.id;
    const targetId = getTargetExprId(state);

    const targetExpr = targetId
      ? await resolveTargetExprId(getTargetExprId(state), state)
      : { kind: ast.ExprKind.Document, id: parentId };

    if (
      [LayerKind.Element, LayerKind.Text].includes(layerKind) &&
      [
        ast.ExprKind.Element,
        ast.ExprKind.Component,
        ast.ExprKind.Slot,
        ast.ExprKind.Insert,
      ].includes(targetExpr?.kind)
    ) {
      parentId = targetExpr.id;
    }

    actions.applyChanges([
      {
        prependChild: {
          parentId,
          childSource: source,
        },
      },
    ]);
  };

  const handleVariantEdited = (
    { payload: { componentId, newName, triggers } }: VariantEdited,
    state: DesignerState
  ) => {
    const variantId = state.activeVariantId;
    if (newName === "") {
      if (variantId) {
        actions.applyChanges([
          {
            deleteExpression: {
              expressionId: variantId,
            },
          },
        ]);
      }
    } else {
      actions.applyChanges([
        {
          updateVariant: {
            componentId,
            variantId,
            name: newName,
            triggers,
          },
        },
      ]);
    }
  };

  const handleTriggerEdited = (
    { payload: { triggers } }: TriggersEdited,
    state: DesignerState
  ) => {
    const triggerId = getTargetExprId(state);
    actions.applyChanges([
      {
        updateTrigger: {
          triggerId,
          triggers,
        },
      },
    ]);
  };

  const handleToolsTextEditorChanged = (
    event: ToolsTextEditorChanged,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        setTextNodeValue: {
          textNodeId: getTargetExprId(state),
          value: event.payload.text,
        },
      },
    ]);
  };

  const handleTextValueChanged = (
    event: TextValueChanged,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        setTextNodeValue: {
          textNodeId: getTargetExprId(state),
          value: event.payload,
        },
      },
    ]);
  };

  const handleAttributeChanged = (
    event: AttributeChanged,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        setElementParameter: {
          targetId: getSelectedExpression(state).id,
          parameterId: event.payload.attributeId,
          parameterName: event.payload.name,
          parameterValue: event.payload.value,
        },
      },
    ]);
  };

  const handleFileFilterChanged = async (
    _event: FileFilterChanged,
    state: DesignerState
  ) => {
    const query = getFileFilter(state);
    await actions.searchFiles(query);
  };

  const handleStyleMixinsSet = (
    { payload: mixinIds }: StyleMixinsSet,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        setStyleMixins: {
          targetExprId: getStyleableTargetId(state),
          mixinIds,
          variantIds: getSelectedVariantIds(state),
        },
      },
    ]);
  };

  const handleFileNavigatorDroppedNode = ({
    payload: { filePath, droppedExprId },
  }: FileNavigatorDroppedNode) => {
    actions.applyChanges([
      {
        moveExpressionToFile: {
          newFilePath: filePath,
          expressionId: droppedExprId,
        },
      },
    ]);
  };

  const handleDeleteExpression = (
    expressionId: string,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        deleteExpression: {
          expressionId,
        },
      },
    ]);
  };

  const handleScriptRemoved = (event: ScriptRemoved) => {
    actions.applyChanges([
      {
        deleteExpression: {
          expressionId: event.payload.id,
        },
      },
    ]);
  };

  const handleScriptSaved = (
    { payload: { id, src, target, name } }: ScriptSaved,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        saveComponentScript: {
          componentId: getSelectedExpression(state).id,
          scriptId: id,
          src,
          target,
          name,
        },
      },
    ]);
  };

  const handleMovedFile = async (
    { payload: { directory, item } }: FileNavigatorDroppedFile,
    state: DesignerState
  ) => {
    if (item.files) {
      await saveFiles(item.files, directory, state);
    } else {
      actions.moveFile(item.path, directory + "/" + item.path.split("/").pop());
    }
  };

  const handleConvertToComponent = (
    name: string,
    { exprId }: ConvertToComponentDetails
  ) => {
    actions.applyChanges([
      {
        convertToComponent: {
          name,
          expressionId: exprId,
        },
      },
    ]);
  };

  const openCodeEditor = (state: DesignerState) => {
    const exprInfo = getSelectedExpressionInfo(state);
    let range: Range;

    if (exprInfo) {
      const { kind, expr } = exprInfo;
      switch (kind) {
        case ast.ExprKind.Element:
        case ast.ExprKind.TextNode:
        case ast.ExprKind.Component:
        case ast.ExprKind.Slot:
        case ast.ExprKind.Insert:
        case ast.ExprKind.Style:
        case ast.ExprKind.Trigger:
        case ast.ExprKind.Atom:
          range = expr.range;
          break;
      }
      if (!range) {
        console.error(`Cannot open code editor for ${kind}`);
        return;
      }
    }

    actions.openCodeEditor(getCurrentFilePath(state), range);
  };

  const openFileInNavigator = (state: DesignerState) => {
    actions.openFileInNavigator(getActiveFilePath(state));
  };

  const handleWrapInElement = (state: DesignerState) => {
    if (!getTargetExprId(state).includes(".")) {
      actions.applyChanges([
        {
          wrapInElement: {
            targetId: getTargetExprId(state),
          },
        },
      ]);
    }
  };

  const handleConvertToSlot = (name: string, details: ConvertToSlotDetails) => {
    actions.applyChanges([
      {
        convertToSlot: {
          expressionId: details.exprId,
          name,
        },
      },
    ]);
  };

  const handleShortcutCommand = (
    command: ShortcutCommand,
    state: DesignerState,
    prevState: DesignerState
  ) => {
    switch (command) {
      case ShortcutCommand.Delete: {
        return handleDeleteKeyPressed(state, prevState);
      }
      case ShortcutCommand.OpenCodeEditor: {
        return openCodeEditor(state);
      }
      case ShortcutCommand.OpenFileInNavigator: {
        return openFileInNavigator(state);
      }
      case ShortcutCommand.WrapInElement: {
        return handleWrapInElement(state);
      }
      case ShortcutCommand.Undo: {
        return handleUndo();
      }
      case ShortcutCommand.Redo: {
        return handleRedo();
      }
      case ShortcutCommand.Save: {
        return handleSave();
      }
    }
  };

  const handleAtomValueChanged = (
    event: AtomValueChangeCompleted,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        setStyleDeclarationValue: {
          targetId: getTargetExprId(state),
          value: event.payload.value,
          imports: event.payload.imports,
        },
      },
    ]);
  };

  const handlePromptClosed = ({
    payload: { value, details },
  }: PromptClosed) => {
    if (!value) {
      return;
    }

    if (details.kind === PromptKind.NewDesignFile) {
      actions.createDesignFile(value, details.parentDirectory);
    } else if (details.kind === PromptKind.NewDirectory) {
      actions.createDirectory(value, details.parentDirectory);
    } else if (details.kind === PromptKind.ConvertToComponent) {
      handleConvertToComponent(value, details);
    } else if (details.kind === PromptKind.ConvertToSlot) {
      handleConvertToSlot(value, details);
    } else if (details.kind === PromptKind.RenameFile) {
      const dir = dirname(details.filePath);
      const extParts = details.filePath.split("/").pop().split(".");

      const ext = extParts.length > 1 ? extParts[extParts.length - 1] : null;

      // could be dir, so we leave out .
      const fileName = !ext ? value : value.replace("." + ext, "") + "." + ext;

      actions.moveFile(details.filePath, dir + "/" + fileName);
    }
  };

  const handleConfirmClose = ({ payload: { yes, details } }: ConfirmClosed) => {
    if (!yes) {
      return;
    }
    if (details.kind === ConfirmKind.DeleteFile) {
      actions.deleteFile(details.filePath);
    }
  };

  const readFileAncestorDirectories = async (filePath: string) => {};

  const handleKeyDown = (
    event: KeyDown,
    state: DesignerState,
    prevState: DesignerState
  ) => {
    const command = getKeyboardMenuCommand(event, getGlobalShortcuts(state));
    if (command != null) {
      handleShortcutCommand(command, state, prevState);
    }
  };

  const handleDroppedResource = async (
    { payload: { item, point } }: ToolsLayerDrop,
    state: DesignerState
  ) => {
    const bounds = {
      ...DEFAULT_FRAME_BOX,
      ...getScaledPoint(point, state.canvas.transform),
    };

    if (item.kind === ResourceKind.File2) {
      await insertResource(
        item.parentPath + "/" + item.name,
        getNodeInfoAtCurrentPoint(state)?.nodeId,
        point,
        state
      );
    } else {
      const expr = ast.getExprInfoById(item.id, state.graph);

      let changes: Mutation[] = [];

      if (expr.kind === ast.ExprKind.Component) {
        changes = [
          {
            appendChild: {
              parentId: state.currentDocument.paperclip.html.sourceId,
              childSource: `
              /**
               * @frame(width: ${bounds.width}, height: ${bounds.height}, x: ${
                bounds.x
              }, y: ${bounds.y})
               */
               import "${ast.getOwnerDependencyPath(
                 item.id,
                 state.graph
               )}" as module
               module.${expr.expr.name}
              `,
            },
          },
        ];
      }
      await actions.applyChanges(changes);
    }
  };

  const saveFiles = async (
    files: File[],
    dir: string,
    state: DesignerState
  ) => {
    if (!dir) {
      console.error(`Can't find directory to drop file to!`);
      return [];
    }

    await Promise.all(
      files.map(async (file) => {
        const buff = await file.arrayBuffer();
        actions.saveFile(dir + "/" + file.name, new Uint8Array(buff));
      })
    );

    return files.map((file) => {
      return (dir + "/" + file.name).replace(state.projectDirectory + "/", "");
    });
  };

  const handleDroppedFile = async (
    { payload: { item, point } }: ToolsLayerDrop,
    state: DesignerState
  ) => {
    const files = item.files as File[];
    const targetNodeId = getNodeInfoAtCurrentPoint(state)?.nodeId;
    await insertFiles(files, targetNodeId, point, state);
  };

  const insertFiles = async (
    files: File[],
    targetNodeId: string,
    point: Point,
    state: DesignerState
  ) => {
    const currentFilePath = getCurrentFilePath(state);
    const currentDir = currentFilePath
      ? dirname(currentFilePath)
      : state.projectDirectory.path;

    const newFiles = await saveFiles(files, currentDir, state);

    // drop files onto the canvas
    //
    for (const filePath of newFiles) {
      await insertResource(filePath, targetNodeId, point, state);
    }
  };

  const insertResource = async (
    path: string,
    hoverindNodeId: string,
    point: any,
    state: DesignerState
  ) => {
    const document = getCurrentDependency(state).document;
    const modulePath = path.replace(state.projectInfo.srcDirectory + "/", "");

    if (hoverindNodeId && isImageAsset(path)) {
      actions.applyChanges([
        {
          setStyleDeclarations: {
            variantIds: getSelectedVariantIds(state),
            expressionId: hoverindNodeId,
            declarations: [
              { name: "background", value: `url("${modulePath}")` },
            ],
          },
        },
      ]);
    } else {
      let frameMetadata: string = "";

      if (point && !hoverindNodeId) {
        const bounds = {
          ...DEFAULT_FRAME_BOX,
          ...getScaledPoint(point, state.canvas.transform),
        };
        frameMetadata = `/**
         * @frame(width: ${bounds.width}, height: ${bounds.height}, x: ${bounds.x}, y: ${bounds.y})
         */`;
      }

      actions.applyChanges([
        {
          appendChild: {
            parentId: document.id,
            childSource: `
              ${frameMetadata}
               div {
                  style {
                    background: url("${modulePath}")
                    background-repeat: no-repeat
                  }
                }
            `,
          },
        },
      ]);
    }
  };

  const handleDroppedFileNavigatorItem = async (
    { payload: { item, point } }: ToolsLayerDrop,
    state: DesignerState
  ) => {
    await insertResource(
      item.path,
      getNodeInfoAtCurrentPoint(state)?.nodeId,
      point,
      state
    );
  };

  const handleDropItem = (event: ToolsLayerDrop, state: DesignerState) => {
    if (event.payload.kind === DNDKind.Resource) {
      handleDroppedResource(event, state);
    } else if (event.payload.kind === NativeTypes.FILE) {
      handleDroppedFile(event, state);
    } else if (event.payload.kind === DNDKind.File) {
      handleDroppedFileNavigatorItem(event, state);
    }
  };

  const handleIDChanged = (event: IDChanged, state: DesignerState) => {
    const expr = getSelectedExpression(state);
    actions.applyChanges([
      {
        setId: {
          expressionId: expr.id,
          value: event.payload.value,
        },
      },
    ]);
  };

  const handleElementTagChanged = (
    event: ElementTagChanged,
    state: DesignerState
  ) => {
    const expr = getSelectedExpression(state);
    actions.applyChanges([
      {
        setTagName: {
          elementId: expr.id,
          tagName: event.payload.tagName,
          tagFilePath: event.payload.sourceFilePath,
        },
      },
    ]);
  };

  const handleHistoryChanged = (
    _event: HistoryChanged,
    state: DesignerState
  ) => {
    // open the document
    const filePath = getCurrentFilePath(state);
    if (
      filePath &&
      filePath !== getRenderedFilePath(state) &&
      isPaperclipFile(filePath)
    ) {
      actions.openFile(filePath);
    }
    maybeExpandAllDirectories(state);
  };

  const maybeExpandAllDirectories = (state: DesignerState) => {
    const filePath = getCurrentFilePath(state);
    if (filePath) {
      actions.expandFilePathDirectories(filePath);
    }
  };

  const handleAddFile = ({ payload: { name } }: DashboardAddFileConfirmed) => {
    actions.createDesignFile(name);
  };

  const handleFileChanged = (event: FileChanged, state: DesignerState) => {
    if (
      event.kind === FileChangedKind.CREATED ||
      event.kind === FileChangedKind.DELETED
    ) {
      actions.readDirectory(dirname(event.path));
    }
  };

  const handleServerEvent = (
    event: DesignServerEvent,
    state: DesignerState
  ) => {
    if (event.modulesEvaluated) {
      handleModulesEvaluated(event.modulesEvaluated, state);
    } else if (event.fileChanged) {
      handleFileChanged(event.fileChanged, state);
    }
  };
  const handleModulesEvaluated = (
    event: ModulesEvaluated,
    state: DesignerState
  ) => {
    const activeFile = getRenderedFilePath(state);
    if (event.filePaths.includes(activeFile)) {
      actions.openFile(activeFile);
    }
  };

  const handleInstanceVariantToggled = (
    event: InstanceVariantToggled,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        toggleInstanceVariant: {
          instanceId: getTargetExprId(state),
          variantId: event.payload,
          comboVariantIds: getSelectedVariantIds(state),
        },
      },
    ]);
  };

  const handleFileNavigatorItemClicked = (item: FSItem) => {
    if (item.kind === FSItemKind.Directory) {
      actions.readDirectory(item.path);
    }
  };

  return (
    event: DesignerEvent,
    newState: DesignerState,
    prevState: DesignerState
  ) => {
    switch (event.type) {
      case "ui/canvasMouseUp": {
        return handleCanvasMouseUp(newState, prevState);
      }
      case "ui/metaClickScript": {
        return handleMetaClickScript(event, prevState);
      }
      case "ui/FileNavigatorContextMenuOpened":
      case "ui/FileNavigatorItemClicked": {
        return handleFileNavigatorItemClicked(event.payload);
      }
      case "shortcuts/itemSelected": {
        return handleShortcutCommand(
          event.payload.command,
          newState,
          prevState
        );
      }
      case "designer-engine/apiError": {
        return handleApiError();
      }
      case "ui/atomValueChangeCompleted": {
        return handleAtomValueChanged(event, newState);
      }
      case "ui/promptClosed": {
        return handlePromptClosed(event);
      }
      case "ui/confirmClosed": {
        return handleConfirmClose(event);
      }
      case "keyboard/keyDown": {
        return handleKeyDown(event, newState, prevState);
      }
      case "ui/styleDeclarationsChangeCompleted": {
        return handleStyleDeclarationChanged(event, newState);
      }
      case "ui/exprNavigatorDroppedNode": {
        return handleExprNavigatorDroppedNode(event, newState);
      }
      case "designer/styleMixinsSet": {
        return handleStyleMixinsSet(event, newState);
      }
      case "ui/FileNavigatorDroppedNode": {
        return handleFileNavigatorDroppedNode(event);
      }
      case "ui/removeVariantButtonClicked": {
        return handleDeleteExpression(event.payload.variantId, newState);
      }
      case "ui/scriptSaved": {
        return handleScriptSaved(event, newState);
      }
      case "ui/scriptRemoved": {
        return handleScriptRemoved(event);
      }
      case "ui/FileNavigatorDroppedFile": {
        return handleMovedFile(event, newState);
      }
      case "designer/variantEdited": {
        return handleVariantEdited(event, newState);
      }
      case "designer/triggersEdited": {
        return handleTriggerEdited(event, newState);
      }
      case "ui/AddLayerMenuItemClicked": {
        return handleAddLayerMenuItemClick(event, newState);
      }
      case "clipboard/expressionPasted": {
        return handlePasteExpression(event, newState);
      }
      case "ui/toolsTextEditorChanged": {
        return handleToolsTextEditorChanged(event, newState);
      }
      case "ui/attributeChanged": {
        return handleAttributeChanged(event, newState);
      }
      case "ui/fileFilterChanged": {
        return handleFileFilterChanged(event, newState);
      }
      case "ui/textValueChanged": {
        return handleTextValueChanged(event, newState);
      }
      case "designer-engine/serverEvent": {
        return handleServerEvent(event.payload, newState);
      }
      case "designer/instanceVariantToggled": {
        return handleInstanceVariantToggled(event, newState);
      }
      case "ui/resizerPathStoppedMoving": {
        return handleResizerStoppedMoving(newState, prevState);
      }
      case "ui/boundsChanged": {
        return handleFrameBoundsChanged(
          newState,
          event.payload.newBounds,
          prevState
        );
      }
      case "ui/toolsLayerDrop": {
        return handleDropItem(event, newState);
      }
      case "ui/idChanged": {
        return handleIDChanged(event, newState);
      }
      case "ui/elementTagChanged": {
        return handleElementTagChanged(event, newState);
      }
      case "history-engine/historyChanged": {
        return handleHistoryChanged(event, newState);
      }
      case "ui/dashboardAddFileConfirmed": {
        return handleAddFile(event);
      }
    }
  };
};

const handleApiError = () => {
  // If API Error, then do a hard reload. Pretty dumb, need a more
  // elegant solution. Though, this should be rare.
  setTimeout(() => {
    window.location.reload();
  }, 1000 * 2);
};

/**
 * Bootstrap script that initializes things based on initial state
 */

const bootstrap = (
  {
    openFile,
    syncGraph,
    syncEvents,
    syncResourceFiles,
    expandFilePathDirectories,
    readDirectory,
    loadProjectInfo,
  }: APIActions,
  initialState: DesignerState
) => {
  loadProjectInfo();
  readDirectory(".");
  syncEvents();
  syncResourceFiles();

  const filePath = getCurrentFilePath(initialState);

  if (filePath) {
    if (isPaperclipFile(filePath)) {
      openFile(filePath);
    }
    expandFilePathDirectories(filePath);
  }

  syncGraph();
};

const dirname = (path: string) => {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
};
