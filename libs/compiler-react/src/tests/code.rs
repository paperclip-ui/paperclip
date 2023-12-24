use crate::compile_code;
use crate::context::Options as CompileOptions;
use futures::executor::block_on;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto_ext::graph::{load::LoadableGraph, test_utils};
use std::collections::HashMap;

// TODO: insert test

macro_rules! add_case {
    ($name: ident, $mock_content: expr, $expected_output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from([
                ("/entry.pc", $mock_content),
                ("/test.pc", r#""#),
            ]));

            let mut graph = Graph::new();

            if let Err(_err) = block_on(graph.load(
                "/entry.pc",
                &mock_fs,
                Options::new(vec![
                    "script".to_string(),
                    "repeat".to_string(),
                    "switch".to_string(),
                    "condition".to_string(),
                ]),
            )) {
                panic!("Unable to load");
            }

            let dep = graph.dependencies.get("/entry.pc").unwrap();

            let output = compile_code(
                &dep,
                &graph,
                CompileOptions {
                    use_exact_imports: false,
                },
            )
            .unwrap();

            println!("{}", output);

            assert_eq!(
                strip_extra_ws(output.as_str()),
                strip_extra_ws($expected_output)
            );
        }
    };
}

add_case! {
  can_compile_a_simple_component,
  r#"component A {
    render div {

    }
  }"#,
  r#"
    import "./entry.pc.css";
    import * as React from "react";

    const _A = (props, ref) => {
        return React.createElement("div", {
            "key": "80f4925f-1",
            "ref": ref
        });
    };
    _A.displayName = "A";
    let A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  can_compile_a_public_component,
  r#"public component A {
    render div {

    }
  }"#,
  r#"
    import "./entry.pc.css";
    import * as React from "react";

    const _A = (props, ref) => {
        return React.createElement("div", {
            "key": "80f4925f-1",
            "ref": ref
        });
    };
    _A.displayName = "A";
    let A = React.memo(React.forwardRef(_A));
    export { A };
  "#
}

add_case! {
  class_names_are_added_to_elements_with_styles,
  r#"public component A {
    render div {
      style {
        color: red
      }
    }
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("div", {
          "className": "_A-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
          "key": "80f4925f-4",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  element_names_are_included_as_classes,
  r#"public component A {
    render div ab {
    }
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement(props.ab.as || "div", {
          ...props.ab,
          "className": "_A-ab-80f4925f-1" + (props.$$scopeClassName ? " " + props.$$scopeClassName : "") + (props.ab && props.ab.className ? " " + props.ab.className : ""),
          "key": "80f4925f-1",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  text_can_be_compiled,
  r#"public component A {
    render span {
      text "Hello"
    }
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("span", {
          "key": "80f4925f-2",
          "ref": ref
      },
          "Hello"
      );
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  attributes_can_be_compiled,
  r#"public component A {
    render span(aria-label: "something")
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("span", {
          "aria-label": "something",
          "key": "80f4925f-3",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  class_names_are_combined,
  r#"public component A {
    render span ab (class: "cd")
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement(props.ab.as || "span", {
          ...props.ab,
          "className": "cd" + " " + "_A-ab-80f4925f-3" + (props.$$scopeClassName ? " " + props.$$scopeClassName : "") + (props.ab && props.ab.className ? " " + props.ab.className : ""),
          "key": "80f4925f-3",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  can_render_nested_elements,
  r#"public component A {
    render span {
      div {

      }
    }
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("span", {
          "key": "80f4925f-2",
          "ref": ref
      },
          React.createElement("div", {
              "key": "80f4925f-1"
          })
      );
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  text_nodes_can_be_used_in_render,
  r#"public component A {
    render text "ab"
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return "ab";
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  slots_are_pulled_from_props,
  r#"public component A {
    render div {
      slot abba
    }
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-2",
          "ref": ref
      },
          props.abba
      );
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  slots_can_be_used_as_render_node,
  r#"public component A {
    render slot abba
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return props.abba;
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  default_slots_can_be_rendered,
  r#"public component A {
    render slot abba {
      text "a"
      div {
        text "b"
      }
    }
  }"#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return props.abba || [
          "a",
          React.createElement("div", {
              "key": "80f4925f-3"
          },
              "b"
          )
      ];
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  instances_can_be_rendered,
  r#"
  component A {
    render slot abba
  }
  component B {
    render A
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return props.abba;
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));

  const _B = (props, ref) => {
      return React.createElement(A, {
          "$$scopeClassName": "_B-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
          "key": "80f4925f-4",
          "ref": ref
      });
  };
  _B.displayName = "B";
  let B = React.memo(React.forwardRef(_B));
  "#
}

add_case! {
  inserts_can_be_rendered,
  r#"
  component A {
    render slot abba
  }
  component B {
    render A {
      insert abba {
        text "Hello"
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return props.abba;
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));

  const _B = (props, ref) => {
      return React.createElement(A, {
          "$$scopeClassName": "_B-80f4925f-6" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
          "abba": [
          "Hello"
      ],
          "key": "80f4925f-6",
          "ref": ref
      });
  };
  _B.displayName = "B";
  let B = React.memo(React.forwardRef(_B));
  "#
}

add_case! {
  can_compile_components_with_props,
  r#"
  component A {
    render div(onClick: onClick)
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-3",
          "onClick": props.onClick,
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  class_name_is_included_in_instance_if_root,
  r#"
  component B {
    render div root
  }
  component A {
    render B root
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _B = (props, ref) => {
      return React.createElement(props.root.as || "div", {
          ...props.root,
          "className": "_B-root-80f4925f-1" + (props.$$scopeClassName ? " " + props.$$scopeClassName : "") + (props.root && props.root.className ? " " + props.root.className : ""),
          "key": "80f4925f-1",
          "ref": ref
      });
  };
  _B.displayName = "B";
  let B = React.memo(React.forwardRef(_B));

  const _A = (props, ref) => {
      return React.createElement(props.root.as || B, {
          ...props.root,
          "$$scopeClassName": "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : "") + (props.root && props.root.className ? " " + props.root.className : ""),
          "key": "80f4925f-4",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  can_import_files,
  r#"
  import "/test.pc" as test

  component A {
    render test.B
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as test from "/test.pc";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement(test.B, {
          "$$scopeClassName": "_A-80f4925f-2" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
          "key": "80f4925f-2",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  scoped_class_name_is_defined_on_instance,
  r#"
  import "/test.pc" as test

  component A {
    render div root (class:class)
  }

  component B {
    render div {
      A {
        override root {
          style {
            color: blue
          }
        }
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as test from "/test.pc";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement(props.root.as || "div", {
          ...props.root,
          "className": props.class + " " + "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : "") + (props.root && props.root.className ? " " + props.root.className : ""),
          "key": "80f4925f-4",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));

  const _B = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-12",
          "ref": ref
      },
          React.createElement(A, {
              "$$scopeClassName": "_B-80f4925f-11",
              "key": "80f4925f-11"
          })
      );
  };
  _B.displayName = "B";
  let B = React.memo(React.forwardRef(_B));
  "#
}

add_case! {
  class_names_arent_renamed_if_instance,
  r#"
  import "/test.pc" as test

  component A {
    render div root (class:class)
  }

  component B {
    render A(class:"blarg")
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as test from "/test.pc";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement(props.root.as || "div", {
          ...props.root,
          "className": props.class + " " + "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : "") + (props.root && props.root.className ? " " + props.root.className : ""),
          "key": "80f4925f-4",
          "ref": ref
      });
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));

  const _B = (props, ref) => {
      return React.createElement(A, {
          "$$scopeClassName": "_B-80f4925f-9" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
          "class": "blarg",
          "key": "80f4925f-9",
          "ref": ref
      });
  };
  _B.displayName = "B";
  let B = React.memo(React.forwardRef(_B));
  "#
}

add_case! {
  styles_are_skipped_as_children,
  r#"
  import "/test.pc" as test

  component A {
    render div {
      style {
        color: red
      }
      span {
        text "something"
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as test from "/test.pc";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("div", {
          "className": "_A-80f4925f-7" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
          "key": "80f4925f-7",
          "ref": ref
      },
          React.createElement("span", {
              "key": "80f4925f-6"
          },
              "something"
          )
      );
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  element_with_id_can_have_props_passed_to_it,
  r#"
  public component AB {
    script(src: "./test.js", target: "react")
    render div {
      span abba {

      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as _f2903221 from "./test.js";
  import * as React from "react";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-7",
          "ref": ref
      },
          React.createElement(props.abba.as || "span", {
              ...props.abba,
              "className": "_AB-abba-80f4925f-6" + (props.abba && props.abba.className ? " " + props.abba.className : ""),
              "key": "80f4925f-6"
          })
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  AB = React.memo(React.forwardRef(_f2903221.default(AB)));
  export { AB };
  "#
}

add_case! {
  can_compile_switches,
  r#"
  public component AB {
    render div {
      switch show {
      case "a" {
            text "a"
        }
        case "b" {
              text "b"
          }
          case "c" {
            span {
                text "c"
            }
            }
        default {
            text "d"
            text "e"
        }
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-12",
          "ref": ref
      },

          props.show === "a" ? [
              "a"
          ] :
          props.show === "b" ? [
              "b"
          ] :
          props.show === "c" ? [
              React.createElement("span", {
                  "key": "80f4925f-6"
              },
                  "c"
              )
          ] : [
              "d",
              "e"
          ]
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  export { AB };
  "#
}

add_case! {
  can_compile_repeat,
  r#"
  public component AB {
    render div {
      repeat items {
        div something (onClick: onClick)
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-5",
          "ref": ref
      },
          props.items && props.items.map(props_items => [
              React.createElement(props_items.something.as || "div", {
                  ...props_items.something,
                  "className": "_AB-something-80f4925f-3" + (props_items.something && props_items.something.className ? " " + props_items.something.className : ""),
                  "key": "80f4925f-3",
                  "onClick": props_items.onClick
              })
          ])
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  export { AB };
  "#
}

add_case! {
  can_compile_condition,
  r#"
  public component AB {
    render div {
      if show {
        text "hello"
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-3",
          "ref": ref
      },
          props.show ? [
              "hello"
          ] : null
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  export { AB };
  "#
}

add_case! {
  can_compile_with_inline_script,
  r#"
  public component AB {
    render div {
      span test (onMouseDown: onMouseDown) {
        script(src: "./blah.tsx", target: "react")
        slot insert {
            a(href: href, onClick: onCLck)
        }
      }
    }
  }
  "#,
  r#"
  import * as _12bdbcf9 from "./blah.tsx";
  import "./entry.pc.css";
  import * as React from "react";

  const ABTest = _12bdbcf9.default(React.forwardRef((props, ref) => {
      return React.createElement(props.test.as || "span", {
          ...props.test,
          "className": "_test-80f4925f-14" + (props.test && props.test.className ? " " + props.test.className : ""),
          "key": "80f4925f-14",
          "onMouseDown": props.onMouseDown,
          "ref": ref
      },
          props.insert || [
              React.createElement("a", {
                  "href": props.href,
                  "key": "80f4925f-12",
                  "onClick": props.onCLck
              })
          ]
      )
  }));

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-15",
          "ref": ref
      },
          React.createElement(ABTest, {
              insert: props.insert,
              onMouseDown: props.onMouseDown,
              test: props.test,
          })
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  export { AB };
  "#
}

add_case! {
  can_compile_an_inline_script_within_a_loop,
  r#"
  public component AB {
    render div {
      repeat items {
        span test (onMouseDown: onMouseDown) {
            script(src: "./item.tsx", target: "react")
        }
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as _4897bf60 from "./item.tsx";
  import * as React from "react";

  const ABTest = _4897bf60.default(React.forwardRef((props, ref) => {
      return React.createElement(props.test.as || "span", {
          ...props.test,
          "className": "_test-80f4925f-8" + (props.test && props.test.className ? " " + props.test.className : ""),
          "key": "80f4925f-8",
          "onMouseDown": props.onMouseDown,
          "ref": ref
      })
  }));

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-10",
          "ref": ref
      },
          props.items && props.items.map(props_items => [
              React.createElement(ABTest, {
                  onMouseDown: props_items.onMouseDown,
                  test: props_items.test,
              })
          ])
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  export { AB };
  "#
}

add_case! {
  can_compile_a_script_with_name,
  r#"
  public component AB {
    script(name: "ABC", src: "./controller.tsx", target: "react")
    render div {

    }
  }
  public component ABCD {
    script(name: "DEF", src: "./controller.tsx", target: "react")
    render div {

    }
  }
  "#,
  r#"
  import * as _792a6e37 from "./controller.tsx";
  import "./entry.pc.css";
  import * as React from "react";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-8",
          "ref": ref
      });
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  AB = React.memo(React.forwardRef(_792a6e37.ABC(AB)));
  export { AB };

  const _ABCD = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-18",
          "ref": ref
      });
  };
  _ABCD.displayName = "ABCD";
  let ABCD = React.memo(React.forwardRef(_ABCD));
  ABCD = React.memo(React.forwardRef(_792a6e37.DEF(ABCD)));
  export { ABCD };
  "#
}

add_case! {
  can_compile_condition_within_insert,
  r#"
  public component A {
    render div {
      insert children {
        if show {
          text "hello"
        }
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
import * as React from "react";

const _A = (props, ref) => {
    return React.createElement("div", {
        "children": [
        props.show ? [
            "hello"
        ] : null
    ],
        "key": "80f4925f-4",
        "ref": ref
    });
};
_A.displayName = "A";
let A = React.memo(React.forwardRef(_A));
export { A };
  "#
}

add_case! {
  can_compile_condition_within_slot,
  r#"
  public component A {
    render div {
      slot children {
        if show {
          text "hello"
        }
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-4",
          "ref": ref
      },
          props.children || [
              props.show ? [
                  "hello"
              ] : null
          ]
      );
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}

add_case! {
  can_compile_repeat_in_slot,
  r#"
  public component A {
    render div {
      insert children {
        repeat stuff {
          text "hello"
        }
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
import * as React from "react";

const _A = (props, ref) => {
    return React.createElement("div", {
        "children": [
        props.stuff && props.stuff.map(props_stuff => [
            "hello"
        ])
    ],
        "key": "80f4925f-4",
        "ref": ref
    });
};
_A.displayName = "A";
let A = React.memo(React.forwardRef(_A));
export { A };
  "#
}

add_case! {
  text_nodes_with_styles_are_rendered_as_spans,
  r#"
  public component A {
    render text "something" {
      style {
        color: blue
      }
    }
  }
  "#,
  r#"
  import "./entry.pc.css";
  import * as React from "react";

  const _A = (props, ref) => {
      return React.createElement("span", { "className": "_A-80f4925f-4" }, "something");
  };
  _A.displayName = "A";
  let A = React.memo(React.forwardRef(_A));
  export { A };
  "#
}
