import { ast } from "../ast/pc-utils";
import { parseFiles } from "./utils";

describe(__filename + "#", () => {
  it(`Can return all components in a document`, async () => {
    const graph = await parseFiles({
      "entry.pc": `
        component A {

        }
        component B {

        }
      `,
    });

    const components = ast.getDocumentComponents(
      graph.dependencies["entry.pc"].document
    );
    expect(components.map((component) => component.name)).toEqual(["A", "B"]);
  });

  it(`Can compute the style of an element`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
      div {
        style {
          color: blue
        }
      }
    `,
      },
      "can_compute_element_style"
    );

    const style = ast.computeElementStyle("33267f8-4", graph);
    expect(ast.serializeComputedStyle(style)).toEqual({
      color: "blue",
    });
  });

  it(`Can compute the style of an element that extends another style defined in the doc`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
      style fontRegular {
        font-family: sans-serif
        font-size: 32px
      }
      div {
        style extends fontRegular {
          color: orange
        }
      }
    `,
      },
      "can_compute_element_style"
    );

    expect(
      ast.serializeComputedStyle(ast.computeElementStyle("33267f8-10", graph))
    ).toEqual({
      color: "orange",
      "font-family": "sans-serif",
      "font-size": "32px",
    });
  });

  it(`Can compute an element style that extends multiple styles`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
      style a {
        background: blue
      }
      style b {
        color: orange
      }
      div {
        style extends a, b
      }
    `,
      },
      "can_compute_element_style"
    );

    expect(
      ast.serializeComputedStyle(ast.computeElementStyle("33267f8-10", graph))
    ).toEqual({
      color: "orange",
      background: "blue",
    });
  });

  it(`Can compute a style on an element that's extending from a style defined in another file`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
      import "./theme.pc" as theme
      div {
        style extends theme.blarg
      }
    `,
        "theme.pc": `
      public style blarg {
        background: blue
      }
    `,
      },
      "can_compute_element_style"
    );

    expect(
      ast.serializeComputedStyle(ast.computeElementStyle("33267f8-4", graph))
    ).toEqual({
      background: "blue",
    });
  });
  it(`Can compute a style on an element that's extending from a style defined in another file`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
      import "./theme.pc" as theme
      div {
        style extends theme.blarg
      }
    `,
        "theme.pc": `
      public style blarg {
        background: blue
      }
    `,
      },
      "can_compute_element_style"
    );

    expect(
      ast.serializeComputedStyle(ast.computeElementStyle("33267f8-4", graph))
    ).toEqual({
      background: "blue",
    });
  });
  it(`Can return the atoms of a graph`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
        public token ab #333
    `,
        "theme.pc": `
      public token cd #111
    `,
      },
      "can_compute_atoms_of_graph"
    );

    expect(ast.getGraphAtoms(graph)).toMatchObject([
      {
        atom: { id: "d03743d5-2" },
        dependency: {
          path: "/private/tmp/pc-workspace/can_compute_atoms_of_graph/entry.pc",
        },
        value: "#333",
        cssValue: "#333",
      },

      {
        atom: { id: "33037e10-2" },
        dependency: {
          path: "/private/tmp/pc-workspace/can_compute_atoms_of_graph/theme.pc",
        },
        value: "#111",
        cssValue: "#111",
      },
    ]);
  });

  it(`Follows atom values`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
        import "./theme.pc" as theme
        public token ab var(theme.cd)
    `,
        "theme.pc": `
      public token cd #111
    `,
      },
      "can_compute_atoms_of_graph"
    );

    expect(ast.getGraphAtoms(graph)).toMatchObject([
      {
        atom: { id: "d03743d5-4" },
        dependency: {
          path: "/private/tmp/pc-workspace/can_compute_atoms_of_graph/entry.pc",
        },
        cssValue: "#111",
        value: "var(theme.cd)",
      },

      {
        atom: { id: "33037e10-2" },
        dependency: {
          path: "/private/tmp/pc-workspace/can_compute_atoms_of_graph/theme.pc",
        },
        value: "#111",
        cssValue: "#111",
      },
    ]);
  });

  it(`Render is returned as a parent`, async () => {
    const graph = await parseFiles(
      {
        "entry.pc": `
          public component A {
            render div
          }
        `,
      },
      "render_is_returned_as_parent"
    );

    expect(ast.getAncestorIds("2e44277c-1", graph)).toMatchObject([
      "2e44277c-2",
      "2e44277c-3",
      "2e44277c-4",
    ]);
  });
});
