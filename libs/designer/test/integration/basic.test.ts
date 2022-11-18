/**
 * @jest-environment jsdom
 */

import { designerEngineEvents } from "@paperclip-ui/designer/src/machine/engine/designer/events";
import { startWorkspace, waitForEvent, stringifyFrames } from "./utils";
import { renderFrames } from "@paperclip-ui/web-renderer";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";

describe(__filename + "#", () => {
  it(`Can evaluate a simple document`, async () => {
    const workspace = await startWorkspace({
      "entry.pc": `
        text "hello"
      `,
    });

    await waitForEvent(designerEngineEvents.documentOpened.type, workspace);

    const frames = stringifyFrames(
      renderFrames(workspace.designer.getState().currentDocument.paperclip, {
        domFactory: document,
      })
    );

    expect(frames).toEqual('<span id="_inner-4f0e8e93-1">hello</span>');
  });
});

describe(__filename + "#", () => {
  it(`Can insert a new frame`, async () => {
    const workspace = await startWorkspace(
      {
        "entry.pc": `
        text "hello"
      `,
      },
      {
        selectedVirtNodeIds: [],
        rects: {
          "0": {
            "0": { x: 0, y: 0, width: 100, height: 10 },
          },
        },
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, workspace);

    workspace.designer.dispatch(editorEvents.eHotkeyPressed());
    workspace.designer.dispatch(
      editorEvents.canvasMouseDown({
        position: { x: 0, y: 0 },
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        timestamp: 0,
      })
    );
    workspace.designer.dispatch(
      editorEvents.canvasMouseUp({
        position: { x: 100, y: 100 },
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        timestamp: 0,
      })
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, workspace);

    const frames = stringifyFrames(
      renderFrames(workspace.designer.getState().currentDocument.paperclip, {
        domFactory: document,
      })
    );

    expect(frames).toEqual(
      '<span id="_inner-4f0e8e93-1">hello</span><div id="_4f0e8e93-15"></div>'
    );
  });
});
