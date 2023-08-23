import {
  DesignerClientImpl,
  GrpcWebImpl,
  DesignServerEvent,
  ModulesEvaluated,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch } from "@paperclip-ui/common";
import { DesignerEngineEvent } from "./events";
import { DesignerEvent } from "../../events";
import {
  AddLayerMenuItemClicked,
  AttributeChanged,
  // DesignerEvent,
  ElementTagChanged,
  ExprNavigatorDroppedNode,
  InstanceVariantToggled,
  StyleDeclarationsChanged,
  StyleMixinsSet,
  ToolsLayerDrop,
  VariantEdited,
} from "../ui/events";

import {
  DEFAULT_FRAME_BOX,
  DesignerState,
  DNDKind,
  findVirtNode,
  FSItem,
  FSItemKind,
  getCurrentFilePath,
  getInsertBox,
  getNodeInfoAtCurrentPoint,
  getRenderedFilePath,
  getTargetExprId,
  InsertMode,
  LayerKind,
} from "../../state";
import {
  Mutation,
  NodePosition,
} from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import {
  Element as VirtElement,
  TextNode as VirtTextNode,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { Box, getScaledBox, getScaledPoint, roundBox } from "../../state/geom";
import {
  getCurrentDependency,
  getSelectedExpression,
  getSelectedExpressionInfo,
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
import { Num, Range } from "@paperclip-ui/proto/lib/generated/ast/base";
import { SimpleExpression } from "@paperclip-ui/proto/lib/generated/ast/pc";

export type DesignerEngineOptions = {
  protocol?: string;
  host: string;
  transport?: any;
};

export const createDesignerEngine =
  ({ protocol, host, transport }: DesignerEngineOptions) =>
  (
    dispatch: Dispatch<DesignerEngineEvent>,
    getState: () => DesignerState
  ): Engine<DesignerState, DesignerEngineEvent> => {
    const client = new DesignerClientImpl(
      new GrpcWebImpl((protocol || "http:") + "//" + host, {
        transport,
      })
    );

    const actions = createActions(client, dispatch);
    const handleEvent = createEventHandler(actions);
    bootstrap(actions, getState());

    const dispose = () => {};
    return {
      handleEvent,
      dispose,
    };
  };

type Actions = ReturnType<typeof createActions>;

/**
 * All of the imperative actions that can be invoked in the engine
 */

const createActions = (
  client: DesignerClientImpl,
  dispatch: Dispatch<DesignerEngineEvent>
) => {
  return {
    async openFile(filePath: string) {
      const data = await client.OpenFile({ path: filePath });

      dispatch({ type: "designer-engine/documentOpened", payload: data });
    },
    async createDesignFile(name: string) {
      const { filePath } = await client.CreateDesignFile({ name });
      dispatch({
        type: "designer-engine/designFileCreated",
        payload: { filePath },
      });
    },
    syncEvents() {
      client.OnEvent({}).subscribe({
        next(event) {
          dispatch({ type: "designer-engine/serverEvent", payload: event });
        },
        error: () => {
          dispatch({ type: "designer-engine/apiError" });
        },
      });
    },
    readDirectory(inputPath: string) {
      client.ReadDirectory({ path: inputPath }).then(({ path, items }) => {
        dispatch({
          type: "designer-engine/directoryRead",
          payload: { items, path, isRoot: inputPath === "." },
        });
      });
    },
    openCodeEditor(path: string, range: Range) {
      client.OpenCodeEditor({ path, range });
    },
    syncResourceFiles() {
      client.GetResourceFiles({}).subscribe({
        next(data) {
          dispatch({
            type: "designer-engine/resourceFilePathsLoaded",
            payload: data.filePaths,
          });
        },
        error: () => {
          dispatch({ type: "designer-engine/apiError" });
        },
      });
    },
    undo() {
      client.Undo({});
    },
    redo() {
      client.Redo({});
    },
    save() {
      client.Save({});
    },
    syncGraph() {
      client.GetGraph({}).subscribe({
        next(data) {
          dispatch({ type: "designer-engine/graphLoaded", payload: data });
        },
        error: () => {},
      });
    },
    async applyChanges(mutations: Mutation[]) {
      const changes = await client.ApplyMutations({ mutations }, null);
      dispatch({ type: "designer-engine/changesApplied", payload: changes });
      return changes;
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
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
        insertFrame: {
          documentId: state.currentDocument.paperclip.html.sourceId,
          bounds,
          nodeSource: {
            [InsertMode.Element]: `div {
              style {
                position: relative
              }
            }`,
            [InsertMode.Text]: `text ""`,
          }[insertMode],
        },
      };

      actions.applyChanges([mutation]);
    } else {
      const relBox = {
        ...bounds,
        x: bounds.x - intersectingNode.box.x,
        y: bounds.y - intersectingNode.box.y,
      };

      const childSource = {
        [InsertMode.Element]: `div {
          style {
            background: rgba(0,0,0,0.1)
            position: absolute
            left: ${relBox.x}px
            top: ${relBox.y}px
            width: ${relBox.width}px
            height: ${relBox.height}px
          }
        }`,
        [InsertMode.Text]: `text ""`,
      }[insertMode];

      const exprInfo = ast.getExprByVirtId(
        intersectingNode.nodeId,
        state.graph
      );

      if (exprInfo?.kind === ast.ExprKind.Slot) {
        const [instanceId] = intersectingNode.nodeId.split(".");
        // const instance = findVirtNode(instanceId, state);

        actions.applyChanges([
          {
            appendInsert: {
              instanceId,
              slotName: exprInfo.expr.name,
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

    const variantIds = state.selectedVariantIds;

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
              state.styleOverrides[getTargetExprId(prevState)]
            ).map(([name, value]) => {
              return { name, value: String(value) };
            }),
          },
        },
      ]);
    } else {
      const newBounds = node.metadata.bounds;

      const mutation: Mutation = {
        setFrameBounds: {
          frameId: node.sourceId,
          bounds: newBounds,
        },
      };
      actions.applyChanges([mutation]);
    }
  };

  const handleExprNavigatorDroppedNode = (
    event: ExprNavigatorDroppedNode,
    state: DesignerState
  ) => {
    const { targetId, droppedExprId, position } = event.payload;

    actions.applyChanges([
      {
        moveNode: {
          targetId,
          nodeId: droppedExprId,
          position: {
            before: NodePosition.BEFORE,
            after: NodePosition.AFTER,
            inside: NodePosition.INSIDE,
          }[position],
        },
      },
    ]);
  };

  const handleStyleDeclarationChanged = (
    event: StyleDeclarationsChanged,
    state: DesignerState
  ) => {
    const style = Object.entries(event.payload.values).map(([name, value]) => ({
      name,
      imports: event.payload.imports,
      value,
    }));
    const variantIds = state.selectedVariantIds;

    actions.applyChanges([
      {
        setStyleDeclarations: {
          variantIds,
          expressionId: getTargetExprId(state),
          declarations: style.filter((kv) => kv.value !== ""),
        },
      },
      {
        deleteStyleDeclarations: {
          expressionId: getTargetExprId(state),
          declarationNames: style
            .filter((kv) => kv.value === "")
            .map((kv) => kv.name),
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
    const kind = {
      [ast.ExprKind.TextNode]: "textNode",
      [ast.ExprKind.Element]: "element",
      [ast.ExprKind.Component]: "component",
    }[event.payload.kind];

    if (!kind) {
      console.error(`Cannot paste: `, event.payload.expr);
      return;
    }

    let targetExpressionId = getTargetExprId(state);

    if (!targetExpressionId) {
      targetExpressionId = state.currentDocument.paperclip.html.sourceId;
    }

    // TODO: need to check when user selects leaf in left sidebar, then need to use
    // that state to insert INTO the element instead of adjacent to it. This is an
    // incomplete solution necessary for cases like: copy -> paste -> paste -> paste
    targetExpressionId = ast.getParent(targetExpressionId, state.graph).id;

    actions.applyChanges([
      {
        pasteExpression: {
          targetExpressionId,
          [kind]: event.payload.expr,
        },
      },
    ]);
  };

  const handleAddLayerMenuItemClick = (
    { payload: layerKind }: AddLayerMenuItemClicked,
    state: DesignerState
  ) => {
    const source = {
      [LayerKind.Atom]: `public token unnamed unset`,
      [LayerKind.Component]: `public component unnamed {}`,
      [LayerKind.Element]: `div`,
      [LayerKind.Text]: `text "double click to edit`,
      [LayerKind.Style]: `public style unnamed {}`,
      [LayerKind.Trigger]: `public trigger unnamed {}`,
    }[layerKind];

    if (!source) {
      return;
    }

    actions.applyChanges([
      {
        prependChild: {
          parentId: getCurrentDependency(state).document.id,
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

  const handleStyleMixinsSet = (
    { payload: mixinIds }: StyleMixinsSet,
    state: DesignerState
  ) => {
    actions.applyChanges([
      {
        setStyleMixins: {
          targetExprId: getTargetExprId(state),
          mixinIds,
          variantIds: state.selectedVariantIds,
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

  const handleConvertToComponent = (state: DesignerState) => {
    // Do not allow for nested instances to be converted to components.
    // Or, at least provide a confirmation for this.
    if (!getTargetExprId(state).includes(".")) {
      actions.applyChanges([
        {
          convertToComponent: {
            expressionId: getTargetExprId(state),
          },
        },
      ]);
    }
  };

  const openCodeEditor = (state: DesignerState) => {
    const { kind, expr } = getSelectedExpressionInfo(state);
    let range: Range;
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

    actions.openCodeEditor(getRenderedFilePath(state), range);
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

  const handleConvertToSlot = (state: DesignerState) => {
    // Do not allow for nested instances to be converted to components.
    // Or, at least provide a confirmation for this.
    if (!getTargetExprId(state).includes(".")) {
      actions.applyChanges([
        {
          convertToSlot: {
            expressionId: getTargetExprId(state),
          },
        },
      ]);
    }
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
      case ShortcutCommand.ConvertToComponent: {
        return handleConvertToComponent(state);
      }
      case ShortcutCommand.OpenCodeEditor: {
        return openCodeEditor(state);
      }
      case ShortcutCommand.WrapInElement: {
        return handleWrapInElement(state);
      }
      case ShortcutCommand.ConvertToSlot: {
        return handleConvertToSlot(state);
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

  const handleDropItem = (
    { payload: { kind, item, point } }: ToolsLayerDrop,
    state: DesignerState
  ) => {
    if (kind === DNDKind.Resource) {
      const bounds = {
        ...DEFAULT_FRAME_BOX,
        ...getScaledPoint(point, state.canvas.transform),
      };

      const expr = ast.getExprInfoById(item.id, state.graph);

      let changes = [];

      if (expr.kind === ast.ExprKind.Component) {
        changes = [
          {
            insertFrame: {
              documentId: state.currentDocument.paperclip.html.sourceId,
              bounds: roundBox(bounds),
              nodeSource: `imp.${expr.expr.name}`,
              imports: {
                imp: ast.getOwnerDependencyPath(item.id, state.graph),
              },
            },
          },
        ];
      }

      actions.applyChanges(changes);
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
    event: HistoryChanged,
    state: DesignerState
  ) => {
    const filePath = getCurrentFilePath(state);
    if (filePath && filePath !== getRenderedFilePath(state)) {
      actions.openFile(filePath);
    }
  };

  const handleAddFile = ({ payload: { name } }: DashboardAddFileConfirmed) => {
    actions.createDesignFile(name);
  };

  const handleServerEvent = (
    event: DesignServerEvent,
    state: DesignerState
  ) => {
    if (event.modulesEvaluated) {
      handleModulesEvaluated(event.modulesEvaluated, state);
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
          comboVariantIds: state.selectedVariantIds,
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
      case "keyboard/keyDown": {
        return handleKeyDown(event, newState, prevState);
      }
      case "ui/styleDeclarationsChanged": {
        return handleStyleDeclarationChanged(event, newState);
      }
      case "ui/exprNavigatorDroppedNode": {
        return handleExprNavigatorDroppedNode(event, newState);
      }
      case "designer/styleMixinsSet": {
        return handleStyleMixinsSet(event, newState);
      }
      case "ui/removeVariantButtonClicked": {
        return handleDeleteExpression(event.payload.variantId, newState);
      }
      case "designer/variantEdited": {
        return handleVariantEdited(event, newState);
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
    readDirectory,
  }: Actions,
  initialState: DesignerState
) => {
  readDirectory(".");
  syncEvents();
  syncResourceFiles();
  const filePath = getCurrentFilePath(initialState);

  setTimeout(() => {
    if (filePath) {
      openFile(filePath);
    }
    syncGraph();
  }, 100);
};
