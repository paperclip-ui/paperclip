use crate::compile_typed_definition;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::parser::parse;
use std::collections::HashMap;

// TODO: insert test

macro_rules! add_case {
    ($name: ident, $mock_content: expr, $expected_output: expr) => {
        #[test]
        fn $name() {
            let path = "/entry.pc".to_string();
            let ast = parse($mock_content, &path).unwrap();
            let dep = Dependency {
                hash: "a".to_string(),
                path: path.to_string(),
                imports: HashMap::new(),
                document: ast,
            };

            let output = compile_typed_definition(&dep).unwrap();
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

    export const A: React.FC<any>;
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