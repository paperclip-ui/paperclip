/**
 * @jest-environment jsdom
 */

import { designerEngineEvents } from "@paperclip-ui/designer/src/machine/engine/designer/events";
import {
  insertCanvasElement,
  startDesigner,
  stringifyDesignerFrames,
  waitForEvent,
} from "../controls";
import { renderFrames } from "@paperclip-ui/web-renderer";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";

describe(__filename + "#", () => {
  it(`Can evaluate a simple document`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        text "hello"
      `,
    });

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    const frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<span id="_4f0e8e93-1">hello</span>');
  });

  it(`Can insert a new frame`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
        text "hello"
      `,
      },
      {
        selectedVirtNodeIds: [],
        rects: {},
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    await insertCanvasElement(designer);

    const frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_edcb8fb4-1"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "edcb8fb4-1",
    ]);
  });

  it(`Can delete a frame`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
        text "hello"
        div
      `,
      },
      {
        selectedVirtNodeIds: ["4f0e8e93-1"],
        rects: {
          "0": {
            "0": { x: 0, y: 0, width: 100, height: 10 },
          },
        },
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div>'
    );

    designer.machine.dispatch(editorEvents.deleteHokeyPressed());
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<div id="_4f0e8e93-2"></div>');
  });

  it(`Frames are automatically selected when inserted`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        text "hello"
        div
      `,
    });

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    await insertCanvasElement(designer);

    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div><div id="_8bc00fda-1"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "8bc00fda-1",
    ]);

    designer.machine.dispatch(editorEvents.deleteHokeyPressed());
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div>'
    );
  });

  it(`Can delete an instance`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
        component A {
          render div {
            text "hello"
          }
        }
        A
        text "Hello"
      `,
      },
      {
        selectedVirtNodeIds: ["4f0e8e93-5"],
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<div id="_4f0e8e93-5" class="_A-4f0e8e93-2 _4f0e8e93-5"><span id="_4f0e8e93-5.4f0e8e93-1">hello</span></div><span id="_4f0e8e93-6">Hello</span>'
    );

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "4f0e8e93-5",
    ]);

    designer.machine.dispatch(editorEvents.deleteHokeyPressed());

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<span id="_4f0e8e93-6">Hello</span>');

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "4f0e8e93-6",
    ]);
  });

  it(`After an instance is deleted, another one is selected`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
          span
          div
      `,
      },
      {
        selectedVirtNodeIds: ["4f0e8e93-1"],
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1"></span><div id="_4f0e8e93-2"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "4f0e8e93-1",
    ]);

    designer.machine.dispatch(editorEvents.deleteHokeyPressed());

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "4f0e8e93-2",
    ]);

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<div id="_4f0e8e93-2"></div>');

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "4f0e8e93-2",
    ]);
  });
});
