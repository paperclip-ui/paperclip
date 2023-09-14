use crate::compile_code;
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

            let output = compile_code(&dep, &graph).unwrap();

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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
    import * as React from "react";

    const _A = (props, ref) => {
        return React.createElement("div", {
            ...props.abProps,
            "className": "_A-ab-80f4925f-1" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
    import * as React from "react";

    const _A = (props, ref) => {
        return React.createElement("span", {
            ...props.abProps,
            "className": "cd" + " " + "_A-ab-80f4925f-3" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
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
    require("./entry.pc.css");
    import * as React from "react";

    const _B = (props, ref) => {
        return React.createElement("div", {
            ...props.rootProps,
            "className": "_B-root-80f4925f-1" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "key": "80f4925f-1",
            "ref": ref
        });
    };
    _B.displayName = "B";
    let B = React.memo(React.forwardRef(_B));

    const _A = (props, ref) => {
        return React.createElement(B, {
            ...props.rootProps,
            "$$scopeClassName": "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
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
    require("./entry.pc.css");
    import * as React from "react";
    import * as test from "/test.pc";
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
  require("./entry.pc.css");
  import * as React from "react";
  import * as test from "/test.pc";
  const _A = (props, ref) => {
      return React.createElement("div", {
          ...props.rootProps,
          "className": props.class + " " + "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
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
    require("./entry.pc.css");
    import * as React from "react";
    import * as test from "/test.pc";
    const _A = (props, ref) => {
        return React.createElement("div", {
            ...props.rootProps,
            "className": props.class + " " + "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
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
    require("./entry.pc.css");
    import * as React from "react";
    import * as test from "/test.pc";
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
  can_compile_with_a_script,
  r#"
  public component AB {
    script(src: "./test.js", target: "react")
    render div {
      text "something"
    }
  }
  "#,
  r#"
  require("./entry.pc.css");
  import * as React from "react";
  import ABScript from "./test.js";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-7",
          "ref": ref
      },
          "something"
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  AB = React.memo(React.forwardRef(ABScript(AB)));
  export { AB };
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
  require("./entry.pc.css");
  import * as React from "react";
  import ABScript from "./test.js";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-7",
          "ref": ref
      },
          React.createElement("span", {
              ...props.abbaProps,
              "className": "_AB-abba-80f4925f-6",
              "key": "80f4925f-6"
          })
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  AB = React.memo(React.forwardRef(ABScript(AB)));
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
  require("./entry.pc.css");
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
  require("./entry.pc.css");
  import * as React from "react";

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-5",
          "ref": ref
      },
          props.items && props.items.map(props_items => [
              React.createElement("div", {
                  ...props_items.somethingProps,
                  "className": "_AB-something-80f4925f-3",
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
  require("./entry.pc.css");
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
      span test {
        script(src: "./blah.tsx", target: "react")
      }
    }
  }
  "#,
  r#"
  require("./entry.pc.css");
  import * as React from "react";
  import ABTestScript from "./blah.tsx";

  const ABTest = ABTestScript(props => {
    return React.createElement("span")
  });

  const _AB = (props, ref) => {
      return React.createElement("div", {
          "key": "80f4925f-3",
          "ref": ref
      },
          React.createElement("ABTest", props.testProps)
      );
  };
  _AB.displayName = "AB";
  let AB = React.memo(React.forwardRef(_AB));
  export { AB };
  "#
}
