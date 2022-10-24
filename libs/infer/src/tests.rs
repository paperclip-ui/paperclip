use anyhow::Result;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph;
use paperclip_parser::graph::test_utils;
use paperclip_parser::pc::parser;
use std::collections::HashMap;

use crate::infer::Inferencer;
use crate::types;

macro_rules! add_case {
    ($name: ident, $mock_files: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }

            let inferencer = Inferencer::new();
            let inference = inferencer.infer_dependency("/entry.pc", &graph).unwrap();
            assert_eq!(inference, $output);
        }
    };
}

add_case! {
  can_infer_a_simple_component,
  [
    (
    "/entry.pc", r#"
      public component Test {
        render div(class: class) {

        }
      }
    "#
    )
  ],
  types::Map::from([
    (
      "Test".to_string(), types::Type::Component(types::Component {
        properties: types::Map::from([
          ("class".to_string(), types::Type::String)
        ])
      })
    )
  ])
}

add_case! {
  can_infer_callback,
  [
    (
    "/entry.pc", r#"
      public component Test {
        render div(onclick: on_click, onmousedown: on_mouse_down, onmouseup: on_mouse_up, onpress: on_press) {

        }
      }
    "#
    )
  ],
  types::Map::from([
    (
      "Test".to_string(), types::Type::Component(types::Component {
        properties: types::Map::from([
          ("on_click".to_string(), types::Type::Callback(types::Callback {
            arguments: vec![types::Type::Reference(types::Reference {
              path: vec!["MouseEvent".to_string()]
            })]
          })),
          ("on_mouse_down".to_string(), types::Type::Callback(types::Callback {
            arguments: vec![types::Type::Reference(types::Reference {
              path: vec!["MouseEvent".to_string()]
            })]
          })),
          ("on_mouse_up".to_string(), types::Type::Callback(types::Callback {
            arguments: vec![types::Type::Reference(types::Reference {
              path: vec!["MouseEvent".to_string()]
            })]
          })),
          ("on_press".to_string(), types::Type::Callback(types::Callback {
            arguments: vec![types::Type::Reference(types::Reference {
              path: vec!["MouseEvent".to_string()]
            })]
          }))
        ])
      })
    )
  ])
}
