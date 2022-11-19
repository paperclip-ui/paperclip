import { designerEngineEvents } from "@paperclip-ui/designer/src/machine/engine/designer/events";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";
import { renderFrames } from "@paperclip-ui/web-renderer";
import { Designer } from "./mock-designer";

export const waitForEvent = (eventType: string, designer: Designer) => {
  return new Promise((resolve) => {
    const dispose = designer.onEvent((event) => {
      if (event.type === eventType) {
        dispose();
        resolve(null);
      }
    });
  });
};

const stringifyFrames = (frames: HTMLElement[]) =>
  frames
    .map((frame) => (frame.childNodes[2] as HTMLDivElement).innerHTML)
    .join("");

export const stringifyDesignerFrames = (designer: Designer) =>
  stringifyFrames(
    renderFrames(designer.machine.getState().currentDocument.paperclip, {
      domFactory: document,
    })
  );

export const insertCanvasElement = async (designer: Designer) => {
  designer.machine.dispatch(editorEvents.eHotkeyPressed());
  designer.machine.dispatch(
    editorEvents.canvasMouseDown({
      position: { x: 0, y: 0 },
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      timestamp: 0,
    })
  );
  designer.machine.dispatch(
    editorEvents.canvasMouseUp({
      position: { x: 100, y: 100 },
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      timestamp: 0,
    })
  );

  await waitForEvent(designerEngineEvents.documentOpened.type, designer);
};
