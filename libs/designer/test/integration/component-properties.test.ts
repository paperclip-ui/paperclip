import {
  startDesigner,
  waitForEvent,
  waitUntilDesignerReady,
} from "../controls";

describe(__filename + "#", () => {
  it(`When a variant is inserted, it is selected`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        component A {
          variant a
        }
      `,
    });
    await waitUntilDesignerReady(designer);
    designer.machine.dispatch({
      type: "designer/variantEdited",
      payload: {
        componentId: "4f0e8e93-2",
        newName: "bbddaaa",
        triggers: [],
      },
    });
    await waitForEvent("designer-engine/documentOpened", designer);
    expect(designer.machine.getState().activeVariantId).toBe("59b5c86-1");
    designer.dispose();
  });
});
