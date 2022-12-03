/**
 * @jest-environment jsdom
 */

import { editorEvents } from "@paperclip-ui/designer/src/machine/events";
import { startDesigner, waitUntilDesignerReady } from "../controls";

describe(__filename + "#", () => {
  xit(`Can select a simple layer`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        text "hello"
      `,
    });
    await waitUntilDesignerReady(designer);

    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([]);
    designer.machine.dispatch(
      editorEvents.layerLeafClicked({ virtId: "4f0e8e93-1" })
    );
    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-1"
    );
    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([
      "4f0e8e93-1",
      "4f0e8e93-2",
    ]);

    designer.dispose();
  });

  it(`A deeply selected element expands all ancestors`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        a {
          b {
            c {
              d {
                text "something"
              }
            }
          }
        }
      `,
    });

    await waitUntilDesignerReady(designer);
    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([]);
    designer.machine.dispatch(
      editorEvents.layerLeafClicked({ virtId: "4f0e8e93-2" })
    );
    expect(designer.machine.getState().selectedVirtNodeId).toEqual(
      "4f0e8e93-2"
    );

    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([
      "4f0e8e93-2",
      "4f0e8e93-3",
      "4f0e8e93-4",
      "4f0e8e93-5",
      "4f0e8e93-6",
    ]);

    designer.dispose();
  });

  it(`When a folder is collapsed, all descendents are closed`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        a {
          b {
            c {
              d {
                text "something"
              }
            }
          }
        }
        
      `,
    });
    await waitUntilDesignerReady(designer);
    designer.machine.dispatch(
      editorEvents.layerLeafClicked({ virtId: "4f0e8e93-2" })
    );
    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([
      "4f0e8e93-2",
      "4f0e8e93-3",
      "4f0e8e93-4",
      "4f0e8e93-5",
      "4f0e8e93-6",
    ]);
    designer.machine.dispatch(
      editorEvents.layerArrowClicked({ virtId: "4f0e8e93-6" })
    );
    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([]);

    designer.dispose();
  });

  it(`When a shadow instances is selected, all instance ancestors are expanded`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        component A {
          render div {
            span {

            }
          }
        }

        A
      `,
    });
    await waitUntilDesignerReady(designer);
    designer.machine.dispatch(
      editorEvents.layerLeafClicked({ virtId: "4f0e8e93-5.4f0e8e93-1" })
    );
    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([
      "4f0e8e93-5.4f0e8e93-1",
      "4f0e8e93-5.4f0e8e93-2",
      "4f0e8e93-5.4f0e8e93-3",
      "4f0e8e93-5.4f0e8e93-4",
      "4f0e8e93-5.4f0e8e93-6",
      "4f0e8e93-5",
      "4f0e8e93-6",
    ]);
    designer.dispose();
  });
});
