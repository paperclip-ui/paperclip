import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { rootReducer } from "@paperclip-ui/designer/src/reducer";
import { loadState } from "./utils";

describe(__filename + "#", () => {
  it("Can select a canvas component", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {

            }
          }
        `,
      },
      extraState: {
        rects: {
          "b0f3b8a2-1": { x: 0, y: 0, width: 100, height: 100, frameIndex: 0 },
        },
      },
    });

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-1");
  });

  it("When hovering over an instance, the instance is highlighted and not its children", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {
              span
            }
          }

          A {}
        `,
      },
      extraState: {
        rects: {
          "b0f3b8a2-5": { x: 0, y: 0, width: 100, height: 100, frameIndex: 0 },
          "b0f3b8a2-5.b0f3b8a2-1": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
        },
      },
    });

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-5");
  });

  it("instance is highlighted if its root node is also an instance", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {
              span
            }
          }

          A {}
        `,
      },
      extraState: {
        scopedElementId: "b0f3b8a2-5",
        rects: {
          "b0f3b8a2-5": { x: 0, y: 0, width: 100, height: 100, frameIndex: 0 },
          "b0f3b8a2-5.b0f3b8a2-1": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
        },
      },
    });

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-5.b0f3b8a2-1");
  });

  it("When focused on an instance of an instance, its children are highlighted", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {
              span
            }
          }

          component B {
            render A
          }

          B
        `,
      },
      extraState: {
        rects: {
          "b0f3b8a2-8.b0f3b8a2-5": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
          "b0f3b8a2-8.b0f3b8a2-5.b0f3b8a2-1": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
        },
      },
    });

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-8.b0f3b8a2-5");
  });

  it("When hovering on an instance, its slots are highlighted", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {
              slot child {
                div
              }
            }
          }

          A
        `,
      },
      extraState: {
        rects: {
          "b0f3b8a2-6": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
          "b0f3b8a2-6.b0f3b8a2-1": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
        },
      },
    });
    console.log(JSON.stringify(state, null, 2));

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-6.b0f3b8a2-2");
  });

  it("When hovering on an instance of an instance, its slots are highlighted", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {
              slot child {
                div
              }
            }
          }

          component B {
            render A {
              insert child {
                slot child2 {
                  div
                }
              }
            }
          }

          B
        `,
      },
      extraState: {
        rects: {
          "b0f3b8a2-12.b0f3b8a2-9": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
          "b0f3b8a2-12.b0f3b8a2-6": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
        },
      },
    });
    console.log(JSON.stringify(state, null, 2));

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-12.b0f3b8a2-7");
  });

  it("When focused on an instance of an instance, its child is highlighted", async () => {
    let state = await loadState({
      files: {
        "/entry.pc": `
          component A {
            render div {
              slot child {
                div
              }
            }
          }

          component B {
            render A {
              insert child {
                span
              }
            }
          }

          B
        `,
      },
      extraState: {
        scopedElementId: "b0f3b8a2-11",
        rects: {
          "b0f3b8a2-11.b0f3b8a2-8": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
          "b0f3b8a2-11.b0f3b8a2-6": {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            frameIndex: 0,
          },
        },
      },
    });
    console.log(JSON.stringify(state, null, 2));

    const events: DesignerEvent[] = [
      { type: "ui/canvasMouseMoved", payload: { x: 10, y: 10 } },
      {
        type: "ui/canvasMouseUp",
        payload: {
          position: { x: 10, y: 10 },
          timestamp: 100,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      },
    ];

    state = events.reduce(rootReducer, state);

    expect(state.highlightedNodeId).toEqual("b0f3b8a2-12.b0f3b8a2-7");
  });
});
