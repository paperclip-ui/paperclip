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
});
