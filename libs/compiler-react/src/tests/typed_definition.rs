use crate::compile_typed_definition;
use paperclip_common::str_utils::strip_extra_ws;

use futures::executor::block_on;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto_ext::graph::{load::LoadableGraph, test_utils};
use std::collections::HashMap;

// TODO: insert test

macro_rules! add_case {
    ($name: ident, $mock_files: expr, $expected_output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
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

            let dep = graph
                .dependencies
                .get("/entry.pc")
                .expect("Cannot get dependency");
            let output = compile_typed_definition(&dep, &graph).expect("Cannot compile");

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
      [
          ("/entry.pc",
          r#"public component A {
            render div {

            }
          }"#)
      ],
  r#"
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
    };
    export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  ignores_private_components,
      [
          (
              "/entry.pc",
              r#"component A {
                render div {

                }
              }"#,
          )
      ],
  r#"
    import * as React from "react";
  "#
}

add_case! {
  a_simple_prop_can_be_inferred,
  [
      (
          "/entry.pc",
          r#"public component A {
            render div(class: class) {

            }
          }"#
      )
  ],
  r#"
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
      "class"?: string,
    };
    export const A: React.FC<BaseAProps>;  "#
}

add_case! {
  children_is_properly_inferred,
  [
   (
       "/entry.pc",
       r#"public component A {
         render div {
           slot children
         }
       }"#
   )
  ],
  r#"
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
      "children"?: React.Children,
    };
    export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  unknown_props_are_inferred,
  [
      (
          "/entry.pc",
          r#"public component A {
            render div(fsdffsfs: fsdfsdfs) {
            }
          }"#
      )
  ],
  r#"
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
      "fsdfsdfs"?: any,
    };
    export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  elements_with_ids_are_inferred,
  [
      (
          "/entry.pc",
          r#"public component A {
            render div ab {
            }
          }"#,
      )
  ],
  r#"
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
      "abProps"?: React.DOMAttributes<any>,
    };
    export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  instances_with_ids_are_inferred_with_required_props,
  [
      (
          "/entry.pc",
          r#"
          public component A {
            render B something {

            }
          }

          public component B {
            render div {

            }
          }
          "#,
      )
  ],
  r#"
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
      "somethingProps": React.ComponentProps<typeof B>,
    };
    export const A: React.FC<BaseAProps>;

    export type BaseBProps = {
      "ref"?: any,
    };
    export const B: React.FC<BaseBProps>;
  "#
}

add_case! {
  imports_definitions_from_other_files,
  [
      (
          "/entry.pc",
          r#"
          import "/mod.pc" as mod
          public component A {
            render mod.B something {

            }
          }
          "#,
      ),
      (
          "/mod.pc",
          r#"
          public component B {
            render div {

            }
          }
          "#,
      )
  ],
  r#"
    import * as mod from "/mod.pc";
    import * as React from "react";

    export type BaseAProps = {
      "ref"?: any,
      "somethingProps": React.ComponentProps<typeof mod.B>,
    };
    export const A: React.FC<BaseAProps>;

  "#
}

add_case! {
  imports_script_definitions,
  [
      (
          "/entry.pc",
          r#"
          public component A {
            script(src: "./something.tsx", target: "react")
            render div {

            }
          }
          "#,
      )
  ],
  r#"
    import * as _38b93036 from "./something.tsx";
    import * as React from "react";

    export type BaseAProps = {
        "ref"?: any,
    };

    export const A: ReturnType<_38b93036.default>;
  "#
}

add_case! {
  switch_cases_are_compiled_as_enums,
  [
      (
          "/entry.pc",
          r#"
          public component A {
            render div {
                switch show {
                    case "a" {

                    }
                    case "b" {

                    }
                    default {

                    }
                }
            }
          }
          "#,
      )
  ],
  r#"
  import * as React from "react";
  export type BaseAProps = {
      "ref"?: any,
      "show"?: "b" | "a",
  };
  export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  repeat_cases_are_compiled_correctly,
  [
      (
          "/entry.pc",
          r#"
          public component A {
            render div {
                repeat items {
                    div(onClick: onClick)
                }
            }
          }
          "#,
      )
  ],
  r#"
  import * as React from "react";
  export type BaseAProps = {
      "ref"?: any,
      "items"?: Array<{
          "onClick"?: any,
      }>,
  };
  export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  nested_repeats_are_compiled_correctly,
  [
      (
          "/entry.pc",
          r#"
          public component A {
            render div {
                repeat a {
                    span (onMouseDown: onMouseDown)
                    repeat b {
                        div (onClick: onClick) {
                            switch c {
                                case "d" {
                                    text "span"
                                }

                                case "e" {
                                        text "span"
                                    }
                            }
                        }
                    }
                }
                span (onClick: onClick)
            }
          }
          "#,
      )
  ],
  r#"
  import * as React from "react";
  export type BaseAProps = {
      "ref"?: any,
      "a"?: Array<{
          "b"?: Array<{
              "c"?: "e",
              "onClick"?: any,
          }>,
          "onMouseDown"?: any,
      }>,
      "onClick"?: any,
  };
  export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  can_repeat_an_instance_with_script,
  [
      (
          "/entry.pc",
          r#"
          public component B {
            script(src: "./b.tsx", target: "react")
            render div {

            }
          }
          public component A {
            render div {
                repeat a {
                    B bb
                }
            }
          }
          "#,
      )
  ],
  r#"
  import * as _5e3fc5cb from "./b.tsx";
  import * as React from "react";
  export type BaseBProps = {
      "ref"?: any,
  };
  export const B: ReturnType<_5e3fc5cb.default>;
  export type BaseAProps = {
      "ref"?: any,
      "a"?: Array<{
          "bb": React.ComponentProps<typeof B>,
      }>,
  };
  export const A: React.FC<BaseAProps>;
  "#
}

add_case! {
  can_compile_condition,
  [
      (
          "/entry.pc",
          r#"
          public component A {
            render div {
                if show {
                    text "something"
                }
            }
          }
          "#,
      )
  ],
  r#"
  import * as React from "react";
  export type BaseAProps = {
      "ref"?: any,
      "show"?: boolean,
  };
  export const A: React.FC<BaseAProps>;
  "#
}
