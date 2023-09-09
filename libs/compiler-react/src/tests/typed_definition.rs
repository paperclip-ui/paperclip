use crate::compile_typed_definition;
use paperclip_common::str_utils::strip_extra_ws;

use futures::executor::block_on;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto_ext::graph::{load::LoadableGraph, test_utils};
use std::collections::HashMap;

// TODO: insert test

macro_rules! add_case {
    ($name: ident, $mock_content: expr, $expected_output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from([("/entry.pc", $mock_content)]));
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
  r#"public component A {
    render div {
      
    }
  }"#,
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
  r#"component A {
    render div {
      
    }
  }"#,
  r#"
    import * as React from "react";
  "#
}

add_case! {
  a_simple_prop_can_be_inferred,
  r#"public component A {
    render div(class: class) {
      
    }
  }"#,
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
  r#"public component A {
    render div {
      slot children
    }
  }"#,
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
  r#"public component A {
    render div(fsdffsfs: fsdfsdfs) {
    }
  }"#,
  r#"
    import * as React from "react";

    export type AProps = {
      "ref"?: any,
      "fsdfsdfs"?: any,
    };
    export const A: React.FC<AProps>;
  "#
}

