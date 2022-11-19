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
      '<span id="_4f0e8e93-1">hello</span><div id="_edcb8fb4-4" class="_edcb8fb4-4"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "edcb8fb4-4",
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
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div><div id="_8bc00fda-4" class="_8bc00fda-4"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "8bc00fda-4",
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

  it(`A node is added to an element when the mouse point releases from an existing element`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
          /**
           * @bounds(x:0, y: 0, width: 1024, height: 768)
           */
          div
      `,
      },
      {
        selectedVirtNodeIds: [],
        rects: {
          "0": {
            "0": { x: 0, y: 0, width: 1024, height: 768 },
          },
        },
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    insertCanvasElement(designer, { x: 10, y: 10 });

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "d2d62a62-19",
    ]);
    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<div id="_4f0e8e93-14"><div id="_d2d62a62-19" class="_d2d62a62-19"></div></div>'
    );
  });

  it(`When deleting a child with no siblings, the parent is selected`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
          div {
            span
          }
      `,
      },
      {
        selectedVirtNodeIds: ["4f0e8e93-1"],
      }
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    console.log(
      JSON.stringify(
        designer.machine.getState().currentDocument.paperclip.html,
        null,
        2
      )
    );
    designer.machine.dispatch(editorEvents.deleteHokeyPressed());
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    expect(designer.machine.getState().selectedVirtNodeIds).toEqual([
      "4f0e8e93-2",
    ]);
  });
});
