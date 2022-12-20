/**
 * @jest-environment jsdom
 */

import { designerEvents } from "@paperclip-ui/designer/src/events";
import { startDesigner, waitUntilDesignerReady } from "../controls";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

describe(__filename + "#", () => {
  xit(`Can select a simple layer`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        text "hello"
      `,
    });
    await waitUntilDesignerReady(designer);

    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([]);
    designer.machine.dispatch({
      type: "editor/layerLeafClicked",
      payload: { virtId: "4f0e8e93-1" },
    });
    expect(designer.machine.getState().selectedTargetId).toEqual("4f0e8e93-1");
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
    designer.machine.dispatch({
      type: "editor/layerLeafClicked",
      payload: { virtId: "4f0e8e93-2" },
    });
    expect(designer.machine.getState().selectedTargetId).toEqual("4f0e8e93-2");

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
    designer.machine.dispatch({
      type: "editor/layerLeafClicked",
      payload: { virtId: "4f0e8e93-2" },
    });
    expect(designer.machine.getState().expandedLayerVirtIds).toEqual([
      "4f0e8e93-2",
      "4f0e8e93-3",
      "4f0e8e93-4",
      "4f0e8e93-5",
      "4f0e8e93-6",
    ]);
    designer.machine.dispatch({
      type: "editor/layerLeafClicked",
      payload: { virtId: "4f0e8e93-6" },
    });
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
    designer.machine.dispatch({
      type: "editor/layerLeafClicked",
      payload: { virtId: "4f0e8e93-1" },
    });
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

  it(`Can delete a component`, async () => {
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
    designer.machine.dispatch({
      type: "editor/layerLeafClicked",
      payload: { virtId: "4f0e8e93-4" },
    });

    let expr = ast.getExprById("4f0e8e93-4", designer.machine.getState().graph);
    expect(expr).toMatchObject({ id: "4f0e8e93-4" });

    designer.machine.dispatch({
      type: "keyboard/keyDown",
      payload: {
        key: "backspace",
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
      },
    });

    await waitUntilDesignerReady(designer);
    expr = ast.getExprById("4f0e8e93-4", designer.machine.getState().graph);
    expect(expr).toEqual(undefined);

    designer.dispose();
  });
});
