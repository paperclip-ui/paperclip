import {
  DesignerClientImpl,
  GrpcWebImpl,
  DesignServerEvent,
  ModulesEvaluated,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch } from "@paperclip-ui/common";
import { DesignerEngineEvent, DocumentOpened } from "./events";
import { DesignerEvent } from "../../events";
import {
  AddLayerMenuItemClicked,
  AtomValueChangeCompleted,
  AtomValueChanged,
  AttributeChanged,
  ConfirmClosed,
  // DesignerEvent,
  ElementTagChanged,
  ExprNavigatorDroppedNode,
  FileFilterChanged,
  FileNavigatorDroppedFile,
  InstanceVariantToggled,
  PromptClosed,
  StyleDeclarationsChangeCompleted,
  StyleDeclarationsChanged,
  StyleMixinsSet,
  TextValueChanged,
  ToolsLayerDrop,
  VariantEdited,
} from "../ui/events";

import {
  ConvertToComponentDetails,
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
import { Range } from "@paperclip-ui/proto/lib/generated/ast/base";
import { get, kebabCase } from "lodash";
import { ConfirmKind } from "../../state/confirm";

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
  const openFile = async (filePath: string) => {
    const data = await client.OpenFile({ path: filePath });
    dispatch({ type: "designer-engine/documentOpened", payload: data });
  };

  const readDirectory = async (inputPath: string) => {
    const { items, path } = await client.ReadDirectory({ path: inputPath });
    dispatch({
      type: "designer-engine/directoryRead",
      payload: { items, path, isRoot: inputPath === "." },
    });
  };

  return {
    openFile,
    readDirectory,
    async deleteFile(filePath: string) {
      // no need to do anything else since file watcher trigger changes
      await client.DeleteFile({ path: filePath });
    },
    async moveFile(fromPath: string, toPath: string) {
      // no need to do anything else since file watcher will trigger changes
      await client.MoveFile({ fromPath, toPath });
    },
    async createDirectory(name: string, parentDir?: string) {
      const filePath = parentDir + "/" + name;

      // // kebab case in case spaces are added
      await client.CreateFile({
        path: filePath,
        kind: FSItemKind.Directory,
      });

      dispatch({
        type: "designer-engine/fileCreated",
        payload: { filePath, kind: FSItemKind.Directory },
      });

      readDirectory(parentDir);
    },
    async createDesignFile(name: string, parentDir?: string) {
      const { filePath } = await client.CreateDesignFile({
        name,
        parentDir,
      });
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

    openCodeEditor(path: string, range: Range) {
      client.OpenCodeEditor({ path, range });
    },
    openFileInNavigator(filePath: string) {
      client.OpenFileInNavigator({ filePath });
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
    async searchFiles(query: string) {
      const { paths, rootDir } = await client.SearchFiles({ query }, null);
      dispatch({
        type: "designer-engine/fileSearchResult",
        payload: { paths, rootDir },
      });
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
              state.styleOverrides[getStyleableTargetId(prevState)]
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
    event: StyleDeclarationsChangeCompleted,
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
          expressionId: getStyleableTargetId(state),
          declarations: style.filter((kv) => kv.value !== ""),
        },
      },
      {
        deleteStyleDeclarations: {
          expressionId: getStyleableTargetId(state),
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

    const targetExpr = ast.getExprInfoById(getTargetExprId(state), state.graph);

    if (
      [LayerKind.Element, LayerKind.Text].includes(layerKind) &&
      [
        ast.ExprKind.Element,
        ast.ExprKind.Component,
        ast.ExprKind.Slot,
        ast.ExprKind.Insert,
      ].includes(targetExpr.kind)
    ) {
      parentId = targetExpr.expr.id;
    }

    console.log(targetExpr, parentId);

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

  const handleDroppedFile = (event: FileNavigatorDroppedFile) => {
    // mv /some/path/to/file-or-dir -> /new/path + /file-or-dir
    actions.moveFile(
      event.payload.item.path,
      event.payload.directory + "/" + event.payload.item.path.split("/").pop()
    );
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
      case ShortcutCommand.OpenCodeEditor: {
        return openCodeEditor(state);
      }
      case ShortcutCommand.OpenFileInNavigator: {
        return openFileInNavigator(state);
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
    } else if (details.kind === PromptKind.RenameFile) {
      const dir = details.filePath.split("/").slice(0, -1).join("/");
      const ext = details.filePath.split("/").pop().split(".").pop();

      actions.moveFile(
        details.filePath,
        dir + "/" + kebabCase(value).replace("." + ext, "") + "." + ext
      );
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

  const handleDocumentOpened = (
    _event: DocumentOpened,
    state: DesignerState
  ) => {
    // read ALL dirs so that they expand in file navigator
    readFileAncestorDirectories(getCurrentFilePath(state));
  };

  const readFileAncestorDirectories = async (filePath: string) => {
    const dirs = filePath.split("/");

    // pop off file name
    dirs.pop();
    while (dirs.length) {
      try {
        await actions.readDirectory(dirs.join("/"));

        // outside of project scope
      } catch (e) {
        break;
      }
      dirs.pop();
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
    // open the document
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
      case "ui/atomValueChangeCompleted": {
        return handleAtomValueChanged(event, newState);
      }
      case "ui/promptClosed": {
        return handlePromptClosed(event);
      }
      case "ui/confirmClosed": {
        return handleConfirmClose(event);
      }
      case "designer-engine/documentOpened": {
        return handleDocumentOpened(event, newState);
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
      case "ui/removeVariantButtonClicked": {
        return handleDeleteExpression(event.payload.variantId, newState);
      }
      case "ui/FileNavigatorDroppedFile": {
        return handleDroppedFile(event);
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
    readDirectory,
  }: Actions,
  initialState: DesignerState
) => {
  readDirectory(".");
  syncEvents();
  syncResourceFiles();
  const filePath = getCurrentFilePath(initialState);

  if (filePath) {
    openFile(filePath);
  }

  syncGraph();
};
