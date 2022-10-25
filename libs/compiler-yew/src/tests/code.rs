use crate::compile_code;
use paperclip_common::str_utils::strip_extra_ws;
use std::collections::HashMap;
use futures::executor::block_on;
use paperclip_parser::graph::{test_utils, Graph};


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
  [
    ("/entry.pc", r#"component A {
      render div
    }"#)
  ],
    r#"
      use yew::prelude::*;
      use yew::{function_component, Children, html, Properties, Callback, MouseEvent};
  
      #[derive(Properties, PartialEq)]
      struct AProps {
        pub __scope_class_name: Option<String>,
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
  [
    ("/entry.pc", r#"component A {
      render div {
        style {
          color: red
        }
      }
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
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
  [
    ("/entry.pc", r#"component A {
      render div {
        style {
          color: red
        }
        slot children
      }
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      #[prop_or_default]
      pub children: Children,
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

add_case! {
  attributes_are_included_in_type,
  [
    ("/entry.pc", r#"component A {
      render div(class: class)
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      pub class: String,
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div class={props.class}></div>
      }
    }
  "#
}

add_case! {
  callbacks_are_infered,
  [
    ("/entry.pc", r#"component A {
      render div(onclick: on_click)
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      pub on_click: Callback<MouseEvent>,
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div onclick={props.on_click}></div>
      }
    }
  "#
}



add_case! {
  can_define_another_slot,
  [
    ("/entry.pc", r#"component A {
      render div {
        slot something
      }
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      pub something: Children,
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div>
            { for props.something.iter() }
        </div>
      }
    }
  "#
}


add_case! {
  can_import_another_module,
  [
    ("/entry.pc", r#"
      import "/a/b/c/module.pc" as mod
      component A {
        render mod.B(cls: cls)
      }
    "#),
    ("/a/b/c/module.pc", r#"public component B {
      render div(class: cls)
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      pub something: Children,
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div>
            { for props.something.iter() }
        </div>
      }
    }
  "#
}


add_case! {
  can_import_another_module,
  [
    ("/entry.pc", r#"
      import "/a/b/c/module.pc" as mod
      component A {
        render mod.B(cls: cls)
      }
    "#),
    ("/a/b/c/module.pc", r#"public component B {
      render div(class: cls)
    }"#)
  ],
  r#"
    use yew::prelude::*;
    use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

    #[derive(Properties, PartialEq)]
    struct AProps {
      pub __scope_class_name: Option<String>,
      pub something: Children,
    }

    #[function_component]
    fn A(props: &AProps) -> Html {
      html! {
        <div>
            { for props.something.iter() }
        </div>
      }
    }
  "#
}

