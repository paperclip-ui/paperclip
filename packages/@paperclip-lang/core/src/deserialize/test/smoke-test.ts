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
            style variant a {
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
          variant b (enabled: [true])
          render A {
            override el {
              style variant b {
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
              style variant b {
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
    [
      `Can turn on instance variants`,
      {
        "file:///entry.pc": `
        public component A {
          variant small (enabled: [])
          render div
        }
        public component B {
          render A {
            override {
              variant small (enabled: true)
            }
          }
        }
        `,
      },
    ],
    [
      `Can define text styles`,
      {
        "file:///entry.pc": `
        public component A {
          render div {
            text "hello" {
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
      `Can override a nested instance variant`,
      {
        "file:///entry.pc": `
        public component B {
          variant selected (enabled: [])
          render span
        }
        public component A {
          render div {
            B inst
          }
        }
        public component A1 {
          render A {
            override inst {
              variant selected (enabled: true)
            }
          }
        }
        `,
      },
    ],

    // TEMPORARY behavior until designer is
    [
      `Can override instance children at the root without specifying ID`,
      {
        "file:///entry.pc": `
        public component C {
          variant selected (enabled: [])
          render span {
            span nested
          }
        }
        public component B {
          render C
        }
        public component A {
          render B {
            override nested {
              style {
                color: blue;
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can insert an element with a name that's shared with the owner`,
      {
        "file:///entry.pc": `
        public component B {
          render div {
            slot test
            span test2
          }
        }
        public component A {
          render div {
            insert test {
              B test
            }
          }
        }
        public component A1 {
          render A {
            override test.test2 {
              style {
                color: red
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can define a slot`,
      {
        "file:///entry.pc": `
        public component B {
          render div
        }
        public component A {
          render div {
            slot test {
              B {
                text "Hello"
              }
            }
          }
        }
        `,
      },
    ],
    [
      `Can import mixins from another file`,
      {
        "file:///test.pc": `
          public style test {
            color: red
          }
        `,
        "file:///entry.pc": `
        import "./test.pc" as imp0
        public component ComponentOption {
          render div {
            style {
              include imp0.test
            }
          }
        }
        `,
      },
    ],
    [
      `Can define bounds `,
      {
        "file:///entry.pc": `

        /**
         * @bounds(width: 100, height: 200)
         */

        public component Test {
          render div
        }


        /**
         * @bounds(width: 100, height: 200)
         */

        public component Test2 {
          render div
        }


        /**
         * @bounds(width: 100, height: 200)
         */

        div {
          style {
            color: red
          }
        }

        /**
         * @bounds(width: 100, height: 200)
         */

        text "hello world"
        `,
      },
    ],
    [
      `Can define metadata for component with imports`,
      {
        "file:///test.pc": `
          public style test {
            color: blue
          }
        `,
        "file:///entry.pc": `
          import "./test.pc" as imp0 

          /**
           * @bounds(left: 101, top: -60, right: 1541, bottom: 840)
           */
          public component Main {
            render div {
              style {
                include imp0.test
              }
            }
          }
        `,
      },
    ],
    [
      `Can use a color token`,
      {
        "file:///test.pc": `
          public token color1 rgba(0,0,0.5)
        `,
        "file:///entry.pc": `
          import "./test.pc" as imp0 

          public component Main {
            render div {
              style {
                color: #{imp0.color1}
              }
            }
          }
        `,
      },
    ],
    [
      `Can define a script on a component`,
      {
        "file:///entry.pc": `
          public component Main {
            script (src: "./test.tsx")
            render div
          }
        `,
      },
    ],
    [
      `Can render an instance as a frame`,
      {
        "file:///entry.pc": `
          public component Main {
            render div
          }

          Main 
        `,
      },
    ],
    [
      `A style mixin can include another style mixins`,
      {
        "file:///entry.pc": `
          public style a {
            color: blue
          }

          public style b {
            include a
            font-family: Helvetica
          }
        `,
      },
    ],
    [
      `Can override instance variants`,
      {
        "file:///entry.pc": `
          public component A {
            variant a1 (enabled: [])
            render div
          }

          public component B {
            render A {
              override {
                variant a1 (enabled: true)
              }
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
