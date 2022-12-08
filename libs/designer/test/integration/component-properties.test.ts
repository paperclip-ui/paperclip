import { designerEngineEvents } from "@paperclip-ui/designer/src/domains/api/events";
import { editorEvents } from "@paperclip-ui/designer/src/events";
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
    designer.machine.dispatch(
      editorEvents.variantEdited({
        componentId: "4f0e8e93-2",
        newName: "bbddaaa",
        triggers: [],
      })
    );
    await waitForEvent(designerEngineEvents.documentOpened.type, designer);
    expect(designer.machine.getState().activeVariantId).toBe("59b5c86-1");
    designer.dispose();
  });
});
