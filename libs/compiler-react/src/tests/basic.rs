use crate::compiler::compile;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::parser::parse;
use std::collections::HashMap;

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
            let output = compile(&dep).unwrap();
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
    const A = (props) => {
      return React.createElement("div", null);
    };
  "#
}

add_case! {
  can_compile_a_public_component,
  r#"public component A {
    render div {
      
    }
  }"#,
  r#"
    export const A = (props) => {
      return React.createElement("div", null);
    };
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
    export const A = (props) => {
      return React.createElement("div", {
        "className": "_80f4925f-4"
      });
    };
  "#
}

add_case! {
  element_names_are_included_as_classes,
  r#"public component A {
    render div ab {
    }
  }"#,
  r#"
    export const A = (props) => {
      return React.createElement("div", {
        "className": "_ab-80f4925f-1"
      });
    };
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
    export const A = (props) => {
      return React.createElement("span", null, [
        "Hello"
      ]);
    };
  "#
}

add_case! {
  attributes_can_be_compiled,
  r#"public component A {
    render span(aria-label: "something")
  }"#,
  r#"
    export const A = (props) => {
      return React.createElement("span", {
        "aria-label": "something"
      });
    };
  "#
}


add_case! {
  class_names_are_combined,
  r#"public component A {
    render span ab (class: "cd")
  }"#,
  r#"
    export const A = (props) => {
      return React.createElement("span", {
        "className": "cd" + " " + "_ab-80f4925f-3"
      });
    };
  "#
}
