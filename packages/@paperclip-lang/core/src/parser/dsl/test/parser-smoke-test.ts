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
            a: 10px
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
        
      } style if something {
        color:blue
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
      `

      /**
       * Hello world
       * @a (width: 100)
       * @bbba()
       * @something this is some random text that works
       * @bla something else with a multi-line
       * value 
       */

      component Test {
        
      }`,
    ],
    [`Can have digits in refs `, `component Test123 {}`],
    [`Can parse elements in the doc`, `div test\n`],
    [
      `Can parse components with styles and children `,
      `
     public component Main {
       render div {
         div container {
           style {
             color: ed
           }
           div {
           }
         }
       }
     }`,
    ],
    [
      `Can override a variant state `,
      `
     public component Main {
       render div {
         override a {
           variant a (on: true)
         }
       }
     }`,
    ],
    [
      `Can parse vars on the document body`,
      `
      public token grey1 rgba(230, 230, 230, 1)

      `,
    ],
    [
      `Can define a variant with a trigger`,
      `component Test {
        variant a (on: true, trigger: [PseudoElement.Hover])
      }`,
    ],
    [
      `Can define an include`,
      `component Test {
        render div {
          style {
            include test
          }
        }
      }`,
    ],
  ].forEach(([title, source]) => {
    it(title, () => {
      const ast = parseDocument(source);
    });
  });
});
