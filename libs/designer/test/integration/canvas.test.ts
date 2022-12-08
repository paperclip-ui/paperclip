/**
 * @jest-environment jsdom
 */

import { designerEngineEvents } from "@paperclip-ui/designer/src/domains/api/events";
import {
  insertCanvasElement,
  startDesigner,
  stringifyDesignerFrames,
  waitForEvent,
  waitUntilDesignerReady,
} from "../controls";
import { designerEvents } from "@paperclip-ui/designer/src/events";
import { shortcutEvents } from "@paperclip-ui/designer/src/domains/shortcuts/events";
import { ShortcutCommand } from "@paperclip-ui/designer/src/domains/shortcuts/state";

describe(__filename + "#", () => {
  it(`Can evaluate a simple document`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        text "hello"
      `,
    });

    await waitUntilDesignerReady(designer);

    const frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<span id="_4f0e8e93-1">hello</span>');
    designer.dispose();
  });

  it(`Can insert a new frame`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
        text "hello"
      `,
      },
      {
        rects: {},
      }
    );

    await waitUntilDesignerReady(designer);

    await insertCanvasElement(designer);

    const frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_edcb8fb4-4" class="_edcb8fb4-4"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "edcb8fb4-4"
    );
    designer.dispose();
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
        selectedVirtNodeId: "4f0e8e93-1",
        rects: {
          "0": {
            "0": { x: 0, y: 0, width: 100, height: 10 },
          },
        },
      }
    );

    await waitUntilDesignerReady(designer);

    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div>'
    );

    designer.machine.dispatch(
      shortcutEvents.itemSelected({ command: ShortcutCommand.Delete })
    );
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<div id="_4f0e8e93-2"></div>');
    designer.dispose();
  });

  it(`Frames are automatically selected when inserted`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        text "hello"
        div
      `,
    });

    await waitUntilDesignerReady(designer);
    await insertCanvasElement(designer);

    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div><div id="_8bc00fda-4" class="_8bc00fda-4"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "8bc00fda-4"
    );

    designer.machine.dispatch(
      shortcutEvents.itemSelected({ command: ShortcutCommand.Delete })
    );
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1">hello</span><div id="_4f0e8e93-2"></div>'
    );
    designer.dispose();
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
        selectedVirtNodeId: "4f0e8e93-5",
      }
    );

    await waitUntilDesignerReady(designer);
    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<div id="_4f0e8e93-2" class="_A-4f0e8e93-2"><span id="_4f0e8e93-1">hello</span></div><div id="_4f0e8e93-5" class="_A-4f0e8e93-2 _4f0e8e93-5"><span id="_4f0e8e93-5.4f0e8e93-1">hello</span></div><span id="_4f0e8e93-6">Hello</span>'
    );

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-5"
    );

    designer.machine.dispatch(
      shortcutEvents.itemSelected({ command: ShortcutCommand.Delete })
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<div id="_4f0e8e93-2" class="_A-4f0e8e93-2"><span id="_4f0e8e93-1">hello</span></div><span id="_4f0e8e93-6">Hello</span>'
    );

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-2"
    );
    designer.dispose();
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
        selectedVirtNodeId: "4f0e8e93-1",
      }
    );

    await waitUntilDesignerReady(designer);
    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<span id="_4f0e8e93-1"></span><div id="_4f0e8e93-2"></div>'
    );

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-1"
    );

    designer.machine.dispatch(
      shortcutEvents.itemSelected({ command: ShortcutCommand.Delete })
    );

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-2"
    );

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<div id="_4f0e8e93-2"></div>');

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-2"
    );
    designer.dispose();
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
        selectedVirtNodeId: null,
        rects: {
          "0": {
            "0": { x: 0, y: 0, width: 1024, height: 768 },
          },
        },
      }
    );

    await waitUntilDesignerReady(designer);
    insertCanvasElement(designer, { x: 10, y: 10 });

    await waitForEvent(designerEngineEvents.documentOpened.type, designer);

    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "31cf58e1-19"
    );
    let frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual(
      '<div id="_4f0e8e93-14"><div id="_31cf58e1-19" class="_31cf58e1-19"></div></div>'
    );
    designer.dispose();
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
        selectedVirtNodeId: "4f0e8e93-1",
      }
    );

    await waitUntilDesignerReady(designer);
    designer.machine.dispatch(
      shortcutEvents.itemSelected({ command: ShortcutCommand.Delete })
    );
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-2"
    );
    designer.dispose();
  });
});
