use crate::compile_typed_definition;
use paperclip_common::str_utils::strip_extra_ws;

use futures::executor::block_on;
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

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }

            let dep = graph.dependencies.get("/entry.pc").unwrap();
            let output = compile_typed_definition(&dep, &graph).unwrap();
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

    export type AProps = {
      "ref"?: any,
    };
    export const A: React.FC<AProps>;
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

    export type AProps = {
      "ref"?: any,
      "class"?: string,
    };
    export const A: React.FC<AProps>;
  "#
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

    export type AProps = {
      "ref"?: any,
      "children"?: React.Children,
    };
    export const A: React.FC<AProps>;
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

    export type AProps = {
      "ref"?: any,
      "fsdfsdfs"?: any,
    };
    export const A: React.FC<AProps>;
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

    export type AProps = {
      "ref"?: any,
      "abProps"?: React.DOMAttributes<any>,
    };
    export const A: React.FC<AProps>;
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

    export type AProps = {
      "ref"?: any,
      "somethingProps": React.ComponentProps<typeof B>,
    };
    export const A: React.FC<AProps>;

    export type BProps = {
      "ref"?: any,
    };
    export const B: React.FC<BProps>;
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
    import * as React from "react";
    import * as mod from "/mod.pc";

    export type AProps = {
      "ref"?: any,
      "somethingProps": React.ComponentProps<typeof mod.B>,
    };
    export const A: React.FC<AProps>;
  "#
}
