import { deserializeModule } from "../deserialize";
import { serializeModule } from "../../serialize";
import { expect } from "chai";
import { DependencyGraph } from "../../graph";
import { ASTDependencyGraph } from "../../parser/dsl/ast";
import { parseDocument } from "../../parser/dsl/parser";

describe(__filename + "#", () => {
  [
    [
      `Can deserialize a simple element`,
      {
        "file:///entry.pc": `public component Test {
          render span
        }`,
      },
    ],
    [
      `Can deserialize variants and attributes`,
      {
        "file:///entry.pc": `public component Test {
          variant a (enabled: [])
          variant b (enabled: [])
          render div  (a: "b", c: "d") {
            style {
              color: red
            }
          }
        }`,
      },
    ],
    [
      `Can deserialize variant styles`,
      {
        "file:///entry.pc": `public component Test {
          variant a (enabled: [PseudoElement.Hover])
          render div  (a: "b", c: "d") {
            style {
              color: red
            }
            style if a {
              color: blue
            }
          }
        }`,
      },
    ],
    [
      `Can override an instance style`,
      {
        "file:///entry.pc": `public component A {
          render div {
            span el
          }
        }
        public component B {
          render A {
            override el {
              style {
                color: blue
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can deserialize a style variant override`,
      {
        "file:///entry.pc": `public component A {
          render div {
            span el
          }
        }
        public component B {
          variant b (enabled: [])
          render A {
            override el {
              style if b {
                color: blue
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can deserialize a variant style defined on an instance in another file`,
      {
        "file:///test.pc": `public component A {
          render div {
            span bbb
          }
        }`,
        "file:///entry.pc": `
        import "./test.pc" as imp0
        public component B {
          variant b (enabled: [])
          render imp0.A {
            override bbb {
              style if b {
                color: blue
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can nest variant overrides`,
      {
        "file:///test.pc": `public component A {
          render div {
            B a {

            }
          }
        }
        public component B {
          render div {
            span b
          }
        }`,
        "file:///entry.pc": `
        import "./test.pc" as imp0
        public component B {
          render imp0.A {
            override a.b {
              style {
                color: orange
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can override a style without override block`,
      {
        "file:///test.pc": `public component A {
          render div {
          }
        }`,
        "file:///entry.pc": `
        import "./test.pc" as imp0
        public component B {
          render imp0.A {
            style {
              color: orange
            }
          }
        }
        `,
      },
    ],
    [
      `Can override a style without override block`,
      {
        "file:///test.pc": `public component A {
          render div {
          }
        }`,
        "file:///entry.pc": `
        import "./test.pc" as imp0
        public component B {
          render imp0.A {
            style {
              color: orange
            }
          }
        }
        `,
      },
    ],
    [
      `Can override instance text`,
      {
        "file:///entry.pc": `
        public component A {
          render div {
            text hello "hello world"
          }
        }
        public component B {
          render A {
            override hello "blarg"
          }
        }
        `,
      },
    ],
  ].forEach(([title, sourceGraph]: any) => {
    it(title, () => {
      const dslGraph: DependencyGraph = {};
      const astGraph: ASTDependencyGraph = {};
      for (const uri in sourceGraph) {
        astGraph[uri] = parseDocument(sourceGraph[uri]);
      }
      for (const uri in astGraph) {
        dslGraph[uri] = {
          uri,
          content: deserializeModule(astGraph[uri], uri, astGraph),
        };
      }

      expect(
        trim(
          serializeModule(
            dslGraph["file:///entry.pc"].content,
            "file:///entry.pc",
            dslGraph
          )
        )
      ).to.eql(trim(sourceGraph["file:///entry.pc"]));
    });
  });
});

const trim = (content: string) => content.replace(/\s+/g, " ").trim();
