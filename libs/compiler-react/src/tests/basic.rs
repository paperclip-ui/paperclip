use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::parser::parse;
use std::collections::HashMap;
use crate::compiler::compile;
use paperclip_common::str_utils::strip_extra_ws;

macro_rules! add_case {
  ($name: ident, $mock_content: expr, $expected_output: expr) => {
      #[test]
      fn $name() {
        let path = "/entry.pc".to_string();
        let ast = parse($mock_content, &path).unwrap();
        let dep = Dependency { hash: "a".to_string(), path: path.to_string(), imports: HashMap::new(), document: ast };
        let output = compile(&dep).unwrap();
        assert_eq!(strip_extra_ws(output.as_str()), strip_extra_ws($expected_output));
      }
  };
}

add_case! {
  can_compile_a_simple_component,
  r#"component A {
    render div {
      
    }
  }"#,
  "const A = () => { render React.createElement(\"div\", null);}"
}

add_case! {
  can_compile_a_public_component,
  r#"public component A {
    render div {
      
    }
  }"#,
  "export const A = () => { render React.createElement(\"div\", null);}"
}
