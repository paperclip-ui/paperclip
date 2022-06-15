import { deserializeModule } from "../deserialize";
import { serializeModule } from "../../serialize";
import { expect } from "chai";
import { DependencyGraph } from "../../graph";

describe(__filename + "#", () => {
  [
    [
      {
        "file:///entry.pc": `public component Test {
          render span
        }`,
      },
    ],
    [
      {
        "file:///entry.pc": `public component Test {
          render div
        }`,
      },
    ],
    [
      {
        "file:///entry.pc": `public component Test {
          variant a (on: true, trigger: [])
          variant b (on: false, trigger: [])
          render div  (a: "b", c: "d") {
            style {
              color: red
            }
          }
        }`,
      },
    ],
    [
      {
        "file:///entry.pc": `public component Test {
          variant a (on: true, trigger: [PseudoElement.Hover])
          render div  (a: "b", c: "d") {
            style {
              color: red
            }
            style if a {
              color: blue;
            }
          }
        }`,
      },
    ],
    [
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
  ].forEach(([graph]) => {
    it(`${JSON.stringify(graph)} can be deserialized`, () => {
      const dslGraph: DependencyGraph = {};
      for (const uri in graph) {
        dslGraph[uri] = { uri, content: deserializeModule(graph[uri], uri) };
      }

      expect(
        trim(
          serializeModule(
            dslGraph["file:///entry.pc"].content,
            "file:///entry.pc",
            dslGraph
          )
        )
      ).to.eql(trim(graph["file:///entry.pc"]));
    });
  });
});

const trim = (content: string) => content.replace(/\s+/g, " ").trim();
