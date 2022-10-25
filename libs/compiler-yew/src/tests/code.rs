use crate::compile_code;
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
            let output = compile_code(&dep).unwrap();
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
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      #[prop_or_default]
      pub children: Children
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div></div>
      }
    }
  "#
}

add_case! {
  can_compile_a_simple_component_with_style,
  r#"component A {
    render div {
      style {
        color: red
      }
    }
  }"#,
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      #[prop_or_default]
      pub children: Children
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div class={if let Some(scope_class_name) = &props.__scope_class_name {
          format!("{} {}", "_A-80f4925f-4", scope_class_name)
        } else {
          "_A-80f4925f-4".to_string()
        }}></div>
      }
    }
  "#
}

add_case! {
  can_compile_a_slot,
  r#"component A {
    render div {
      style {
        color: red
      }
      slot children
    }
  }"#,
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      #[prop_or_default]
      pub children: Children
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div class={if let Some(scope_class_name) = &props.__scope_class_name {
          format!("{} {}", "_A-80f4925f-5", scope_class_name)
        } else {
          "_A-80f4925f-5".to_string()
        }}>
          { for props.children.iter() }
        </div>
      }
    }
  "#
}
