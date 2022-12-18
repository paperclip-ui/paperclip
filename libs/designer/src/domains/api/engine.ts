import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { DesignerEvent as DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch } from "@paperclip-ui/common";
import { DesignerEngineEvent, designerEngineEvents } from "./events";
import { DesignerEvent, designerEvents } from "../../events";
import {
  DEFAULT_FRAME_BOX,
  DesignerState,
  DNDKind,
  flattenFrameBoxes,
  getInsertBox,
  getNodeInfoAtPoint,
  InsertMode,
} from "../../state";
import { Mutation } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import {
  Element as VirtElement,
  TextNode as VirtTextNode,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { getScaledBox, getScaledPoint, roundBox } from "../../state/geom";
import {
  getEnabledVariants,
  getSelectedExprAvailableVariants,
} from "../../state/pc";
import { keyboardEvents } from "../keyboard/events";
import {
  getGlobalShortcuts,
  getKeyboardMenuCommand,
  ShortcutCommand,
} from "../shortcuts/state";
import { shortcutEvents } from "../shortcuts/events";

export type DesignerEngineOptions = {
  protocol?: string;
  host: string;
  transport?: any;
};

export const createDesignerEngine =
  ({ protocol, host, transport }: DesignerEngineOptions) =>
  (
    dispatch: Dispatch<DesignerEngineEvent>,
    state: DesignerState
  ): Engine<DesignerState, DesignerEngineEvent> => {
    const client = new DesignerClientImpl(
      new GrpcWebImpl((protocol || "http:") + "//" + host, {
        transport,
      })
    );

    const actions = createActions(client, dispatch);
    const handleEvent = createEventHandler(actions);
    bootstrap(actions, dispatch, state);

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

const createActions = (client: DesignerClientImpl, dispatch: Dispatch<any>) => {
  return {
    openFile(filePath: string) {
      client.OpenFile({ path: filePath }).subscribe({
        next(data) {
          dispatch(designerEngineEvents.documentOpened(data));
        },
        complete() {},
        error() {},
      });
    },
    onEvent(listener: (event: DesignServerEvent) => void) {
      client.OnEvent({}).subscribe({
        next: listener,
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
          dispatch(designerEngineEvents.graphLoaded(data));
        },
      });
    },
    async applyChanges(mutations: Mutation[]) {
      const changes = await client.ApplyMutations({ mutations }, null);
      dispatch(designerEngineEvents.changesApplied(changes));
      return changes;
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
  const handleInsert = async (state: DesignerState) => {
    let bounds = getScaledBox(getInsertBox(state), state.canvas.transform);
    const insertMode = state.insertMode;

    const intersectingNode = getNodeInfoAtPoint(
      state.canvas.mousePosition,
      state.canvas.transform,
      flattenFrameBoxes(state.rects)
    );

    if (!intersectingNode) {
      const mutation: Mutation = {
        insertFrame: {
          documentId: state.currentDocument.paperclip.html.sourceId,
          bounds: roundBox(bounds),
          nodeSource: {
            [InsertMode.Element]: `div {
              style {
                position: relative
              }
            }`,
            [InsertMode.Text]: `text "Type something"`,
          }[insertMode],
        },
      };

      actions.applyChanges([mutation]);
    } else {
      const parent = virtHTML.getNodeByPath(
        intersectingNode.nodePath,
        state.currentDocument.paperclip.html
      );

      const parentBox = flattenFrameBoxes(state.rects)[
        intersectingNode.nodePath
      ];

      bounds = roundBox({
        ...bounds,
        x: bounds.x - parentBox.x,
        y: bounds.y - parentBox.y,
      });

      actions.applyChanges([
        {
          appendChild: {
            parentId: parent.sourceId,
            childSource: {
              [InsertMode.Element]: `div {
                style {
                  background: rgba(0,0,0,0.1)
                  position: absolute
                  left: ${bounds.x}px
                  top: ${bounds.y}px
                  width: ${bounds.width}px
                  height: ${bounds.height}px
                }
              }`,
              [InsertMode.Text]: `text "Type something"`,
            }[insertMode],
          },
        },
      ]);
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
    const node = virtHTML.getNodeById(
      prevState.selectedVirtNodeId,
      prevState.currentDocument.paperclip.html
    ) as VirtTextNode | VirtElement;

    if (!node) {
      console.warn(`Node doesn't exist, skipping delete`);
      return;
    }
    handleDeleteExpression(node.sourceId);
  };

  const handleResizerStoppedMoving = (
    event: ReturnType<typeof designerEvents.resizerPathStoppedMoving>,
    state: DesignerState,
    prevState: DesignerState
  ) => {
    const node = virtHTML.getNodeById(
      prevState.selectedVirtNodeId,
      prevState.currentDocument.paperclip.html
    ) as VirtTextNode | VirtElement;

    const variantIds = getEnabledVariants(state).map((variant) => variant.id);

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
              state.styleOverrides[prevState.selectedVirtNodeId]
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

  const handleStyleDeclarationChanged = (
    event: ReturnType<typeof designerEvents.styleDeclarationsChanged>,
    state: DesignerState
  ) => {
    const style = Object.entries(event.payload.values).map(([name, value]) => ({
      name,
      imports: event.payload.imports,
      value,
    }));
    const variantIds = getEnabledVariants(state).map((variant) => variant.id);

    actions.applyChanges([
      {
        setStyleDeclarations: {
          variantIds,
          expressionId: state.selectedVirtNodeId,
          declarations: style.filter((kv) => kv.value !== ""),
        },
      },
      {
        deleteStyleDeclarations: {
          expressionId: state.selectedVirtNodeId,
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
  const handleVariantEdited = (
    {
      payload: { componentId, newName, triggers },
    }: ReturnType<typeof designerEvents.variantEdited>,
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

  const handleDeleteExpression = (expressionId: string) => {
    actions.applyChanges([
      {
        deleteExpression: {
          expressionId,
        },
      },
    ]);
  };

  const handleVariantsSelected = (
    selectedVariants: string[],
    state: DesignerState
  ) => {
    const availableVariants = getSelectedExprAvailableVariants(state);

    const enabled = {};

    for (const variant of availableVariants) {
      enabled[variant.id] = selectedVariants.includes(variant.id);
    }

    actions.applyChanges([
      {
        toggleVariants: { enabled },
      },
    ]);
  };

  const handleConvertToComponent = (state: DesignerState) => {
    // Do not allow for nested instances to be converted to components.
    // Or, at least provide a confirmation for this.
    if (!state.selectedVirtNodeId.includes(".")) {
      actions.applyChanges([
        {
          convertToComponent: {
            expressionId: state.selectedVirtNodeId,
          },
        },
      ]);
    }
  };
  const handleConvertToSlot = (state: DesignerState) => {
    // Do not allow for nested instances to be converted to components.
    // Or, at least provide a confirmation for this.
    if (!state.selectedVirtNodeId.includes(".")) {
      actions.applyChanges([
        {
          convertToSlot: {
            expressionId: state.selectedVirtNodeId,
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
    event: ReturnType<typeof keyboardEvents.keyDown>,
    state: DesignerState,
    prevState: DesignerState
  ) => {
    const command = getKeyboardMenuCommand(event, getGlobalShortcuts(state));
    if (command != null) {
      handleShortcutCommand(command, state, prevState);
    }
  };

  const handleDropItem = (
    {
      payload: { kind, item, point },
    }: ReturnType<typeof designerEvents.toolsLayerDrop>,
    state: DesignerState
  ) => {
    if (kind === DNDKind.Resource) {
      const bounds = {
        ...DEFAULT_FRAME_BOX,
        ...getScaledPoint(point, state.canvas.transform),
      };

      const expr = ast.getExprById(item.id, state.graph);

      let changes = [];

      if (ast.isComponent(expr)) {
        changes = [
          {
            insertFrame: {
              documentId: state.currentDocument.paperclip.html.sourceId,
              bounds: roundBox(bounds),
              nodeSource: `imp.${expr.name}`,
              imports: {
                imp: ast.getOwnerDependencyPath(item.id, state.graph),
              },
            },
          },
        ];
      }

      console.log(changes);

      actions.applyChanges(changes);
    }
  };

  return (
    event: DesignerEvent,
    newState: DesignerState,
    prevState: DesignerState
  ) => {
    switch (event.type) {
      case designerEvents.canvasMouseUp.type: {
        return handleCanvasMouseUp(newState, prevState);
      }
      case shortcutEvents.itemSelected.type: {
        return handleShortcutCommand(
          event.payload.command,
          newState,
          prevState
        );
      }
      case keyboardEvents.keyDown.type: {
        return handleKeyDown(event, newState, prevState);
      }
      case designerEvents.styleDeclarationsChanged.type: {
        return handleStyleDeclarationChanged(event, newState);
      }
      case designerEvents.variantsSelected.type: {
        return handleVariantsSelected(event.payload, newState);
      }
      case designerEvents.removeVariantButtonClicked.type: {
        return handleDeleteExpression(event.payload.variantId);
      }
      case designerEvents.variantEdited.type: {
        return handleVariantEdited(event, newState);
      }
      case designerEvents.resizerPathStoppedMoving.type: {
        return handleResizerStoppedMoving(event, newState, prevState);
      }
      case designerEvents.toolsLayerDrop.type: {
        return handleDropItem(event, newState);
      }
    }
  };
};

/**
 * Bootstrap script that initializes things based on initial state
 */

const bootstrap = (
  { openFile, syncGraph, onEvent }: Actions,
  dispatch: Dispatch<DesignerEvent>,
  initialState: DesignerState
) => {
  onEvent((event) => {
    dispatch(designerEngineEvents.serverEvent(event));
  });

  setTimeout(() => {
    openFile(initialState.history.query.file);
    syncGraph();
  }, 100);
};
