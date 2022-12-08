/**
 * @jest-environment jsdom
 */

import { designerEngineEvents } from "@paperclip-ui/designer/src/domains/api/events";
import { designerEvents } from "@paperclip-ui/designer/src/events";
import { Point } from "@paperclip-ui/designer/src/state/geom";
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

export const waitUntilDesignerReady = (designer: Designer) => {
  return new Promise((resolve) => {
    const dispose = designer.onEvent((event) => {
      switch (event.type) {
        case designerEngineEvents.documentOpened.type:
        case designerEngineEvents.graphLoaded.type: {
          const state = designer.machine.getState();
          const isReady =
            Object.keys(state.graph.dependencies).length > 0 &&
            state.currentDocument != null;
          if (isReady) {
            dispose();
            resolve(null);
          }
        }
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

export const insertCanvasElement = async (
  designer: Designer,
  position: Point = { x: 0, y: 0 }
) => {
  designer.machine.dispatch(designerEvents.eHotkeyPressed());
  designer.machine.dispatch(
    designerEvents.canvasMouseDown({
      position: { x: 0, y: 0 },
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      timestamp: 0,
    })
  );
  designer.machine.dispatch(
    designerEvents.canvasMouseUp({
      position,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      timestamp: 0,
    })
  );

  await waitForEvent(designerEngineEvents.documentOpened.type, designer);
};
