use futures::executor::block_on;
use paperclip_core::proto::graph::{load::LoadableGraph, test_utils};
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::graph_ext as graph;

use std::collections::HashMap;

use crate::infer::Inferencer;
use crate::types;

macro_rules! add_case {
    ($name: ident, $mock_files: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs, Options::new(vec![]))) {
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
      "Test".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("class".to_string(), types::MapProp {
                  prop_type: types::Type::String,
                  optional: true
              })
            ])
          }),
          optional: true
      }
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
      "Test".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("on_click".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              }),
              ("on_mouse_down".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              }),
              ("on_mouse_up".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              }),
              ("on_press".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              })
            ])
          }),
          optional: true
      }
    )
  ])
}

add_case! {
  prop_is_undefined_if_no_link,
  [
    (
    "/entry.pc", r#"
      public component B {
        render span
      }
      public component A {
        render B(cd: class)
      }
    "#
    )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("class".to_string(), types::MapProp {
                  prop_type: types::Type::Unknown,
                  optional: true
              })
            ])
          }),
          optional: true
      },
    ),
    (
      "B".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([])
          }),
          optional: true
      }
    )
  ])
}

add_case! {
  prop_is_string_if_linked_to_class,
  [
    (
    "/entry.pc", r#"
      public component B {
        render span(class: cd)
      }
      public component A {
        render B(cd: class)
      }
    "#
    )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("class".to_string(), types::MapProp {
                  prop_type: types::Type::String,
                  optional: true
              })
            ])
          }),
          optional: true
      },
    ),
    (
      "B".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("cd".to_string(), types::MapProp {
                  prop_type: types::Type::String,
                  optional: true
              })
            ])
          }),
          optional: true
      }
    )
  ])
}

add_case! {
  prop_is_string_if_linked_to_callback,
  [
    (
    "/entry.pc", r#"
      public component B {
        render span(onclick: cd)
      }
      public component A {
        render B(cd: blarg)
      }
    "#
    )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("blarg".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              }),
            ])
          }),
          optional: true
      },
    ),
    (
      "B".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("cd".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              }),
            ])
          }),
          optional: true
      }
    )
  ])
}

add_case! {
  can_infer_props_from_an_imported_module,
  [
    (
    "/entry.pc", r#"
      import "/module.pc" as mod
      public component A {
        render mod.B(cd: blarg)
      }
    "#
    ),
    (
      "/module.pc", r#"
        public component B {
          render span(onclick: cd)
        }
      "#
      )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("blarg".to_string(), types::MapProp {
                  prop_type: types::Type::Callback(types::Callback {
                    arguments: vec![types::Type::Reference(types::Reference {
                      path: vec!["MouseEvent".to_string()]
                    })]
                  }),
                  optional: true
              }),
            ])
          }),
          optional: true
      },
    )
  ])
}

add_case! {
  can_infer_nested_elements,
  [
    (
    "/entry.pc", r#"
      public component A {
        render div {
          span(class: class) {

          }
        }
      }
    "#
    )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("class".to_string(), types::MapProp {
                  prop_type: types::Type::String,
                  optional: true
              }),
            ])
          }),
          optional: true
      },
    )
  ])
}

add_case! {
  can_infer_slots,
  [
    (
    "/entry.pc", r#"
      public component A {
        render div {
          slot something
        }
      }
    "#
    )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("something".to_string(), types::MapProp {
                  prop_type: types::Type::Slot,
                  optional: true
              }),
            ])
          }),
          optional: true
      },
    )
  ])
}

add_case! {
  can_infer_slot_in_insert,
  [
    (
    "/entry.pc", r#"
      public component A {
        render div {
          insert ab {
            slot something
          }
        }
      }
    "#
    )
  ],
  types::Map::from([
    (
      "A".to_string(), types::MapProp {
          prop_type: types::Type::Component(types::Component {
            properties: types::Map::from([
              ("something".to_string(), types::MapProp {
                  prop_type: types::Type::Slot,
                  optional: true
              }),
            ])
          }),
          optional: true
      },
    )
  ])
}
