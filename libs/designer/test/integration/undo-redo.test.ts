/**
 * @jest-environment jsdom
 */

import { ShortcutCommand } from "@paperclip-ui/designer/src/domains/shortcuts/state";
import {
  insertCanvasElement,
  startDesigner,
  stringifyDesignerFrames,
  waitForEvent,
  waitUntilDesignerReady,
} from "../controls";

describe(__filename + "#", () => {
  it(`Can undo a change`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
        text "hello"
      `,
      },
      {},
      "can_undo_a_change"
    );

    await waitUntilDesignerReady(designer);

    await insertCanvasElement(designer, { x: 0, y: 0 });
    let frames = stringifyDesignerFrames(designer);
    expect(frames).toBe(
      `<span id=\"_b5c97432-1\">hello</span><div id=\"_98d0141d-4\" class=\"_98d0141d-4\"></div>`
    );

    designer.machine.dispatch({
      type: "shortcuts/itemSelected",
      payload: { command: ShortcutCommand.Undo },
    });
    await waitForEvent("designer-engine/documentOpened", designer);
    frames = stringifyDesignerFrames(designer);
    expect(frames).toBe(`<span id="_b5c97432-1">hello</span>`);

    designer.dispose();
  });
  it(`Can redo a change`, async () => {
    const designer = await startDesigner(
      {
        "entry.pc": `
        text "hello"
      `,
      },
      {},
      "can_redo_a_change"
    );

    await waitUntilDesignerReady(designer);

    await insertCanvasElement(designer, { x: 0, y: 0 });
    let frames = stringifyDesignerFrames(designer);
    expect(frames).toBe(
      `<span id=\"_8efcc1e7-1\">hello</span><div id=\"_d83ca679-4\" class=\"_d83ca679-4\"></div>`
    );
    designer.machine.dispatch({
      type: "shortcuts/itemSelected",
      payload: { command: ShortcutCommand.Undo },
    });
    await waitForEvent("designer-engine/documentOpened", designer);
    frames = stringifyDesignerFrames(designer);
    expect(frames).toBe(`<span id="_8efcc1e7-1">hello</span>`);
    designer.machine.dispatch({
      type: "shortcuts/itemSelected",
      payload: { command: ShortcutCommand.Redo },
    });
    await waitForEvent("designer-engine/documentOpened", designer);
    frames = stringifyDesignerFrames(designer);
    expect(frames).toBe(
      `<span id=\"_8efcc1e7-1\">hello</span><div id=\"_d83ca679-4\" class=\"_d83ca679-4\"></div>`
    );

    designer.dispose();
  });
});
