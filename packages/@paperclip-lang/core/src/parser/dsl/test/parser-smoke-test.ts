import { parseDocument } from "../parser";

describe(__filename + "#", () => {
  [
    [
      `Can parse variants`,
      `component Test {
        variant test
        variant abba (on: true)
      }`,
    ],
    [
      `Can parse a simple render element`,
      `component Test {
        render div {
          
        }
      }`,
    ],
    [
      `Can parse a text node`,
      `component Test {
        render text "Hello"
      }`,
    ],
    [
      `Can parse a text node with a style`,
      `component Test {
        render text "Hello" {
          style {
          }
        }
      }`,
    ],
    [
      `Can parse attributes`,
      `component Test {
        render div (a: "b", c: -1, d: d) {
          
        }
      }`,
    ],
    [
      `Can parse an element with a child`,
      `component Test {
        render div {
          span {
            text "hello world"       
          }
        }
      }`,
    ],
    [
      `Can parse a style on the document`,
      `style test {
        color: red
      }`,
    ],
    [
      `Can parse a style with a conditional`,
      `style test {
        color: red
        if something {
          color:blue
        }
      }`,
    ],
    [
      `Can parse imports`,
      `import "./a/b/c.pc" as imp
      component Test {
        
      }`,
    ],
    [
      `Can parse an imported instance`,
      `import "./a/b/c.pc" as imp
      component Test {
        render imp.Test (a: true) {

        }
      }`,
    ],
    [
      `Can parse an override`,
      `import "./a/b/c.pc" as imp
      component Test {
        render imp.Test (a: true) {
          override {
            style {
              color: red
            }
          }
        }
      }`,
    ],
    [
      `Can parse an override with a target`,
      `import "./a/b/c.pc" as imp
      component Test {
        render imp.Test (a: true) {
          override a.b.c {
            style {
              color: red
            }
          }
        }
      }`,
    ],
    [
      `Can parse an override with a target and a constructor value`,
      `import "./a/b/c.pc" as imp
      component Test {
        render imp.Test (a: true) {
          override a.b.c "efc"
        }
      }`,
    ],
    [
      `Can parse a multi-line comment`,
      `import "./a/b/c.pc" as imp

      /**
       * Hello world
       * @preview { }
       */

      component Test {
        render imp.Test (a: true) {
          override a.b.c "efc"
        }
      }`,
    ],
  ].forEach(([title, source]) => {
    it(title, () => {
      const ast = parseDocument(source);
      console.log(JSON.stringify(ast, null, 2));
    });
  });
});
