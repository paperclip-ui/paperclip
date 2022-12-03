use crate::edit_graph;
use futures::executor::block_on;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::pc;
use paperclip_proto::ast_mutate::{
    mutation, AppendChild, Bounds, DeleteExpression, SetFrameBounds, SetStyleDeclarationValue,
    SetStyleDeclarations,
};
use paperclip_proto::{ast::graph_ext as graph, ast_mutate::DeleteStyleDeclarations};
use paperclip_proto_ext::graph::{load::LoadableGraph, test_utils};
use std::collections::HashMap;

macro_rules! case {
    ($name: ident, $mock_files: expr, $edit: expr, $expected_mock_files: expr) => {
        #[test]
        pub fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }

            edit_graph(&mut graph, &vec![$edit]);

            let edited_docs = graph
                .dependencies
                .iter()
                .map(|(path, dep)| {
                    (
                        path.to_string(),
                        pc::serializer::serialize(
                            dep.document.as_ref().expect("Document must exist"),
                        ),
                    )
                })
                .collect::<HashMap<String, String>>();

            println!("{:#?}", graph.dependencies.get("/entry.pc"));

            for (path, content) in $expected_mock_files {
                if let Some(serialized_content) = edited_docs.get(path) {
                    assert_eq!(strip_extra_ws(serialized_content), strip_extra_ws(&content));
                }
            }
        }
    };
}

case! {
  can_insert_an_element_into_the_document,
  [(
    "/entry.pc", r#"
      div {

      }
    "#
  )],
  mutation::Inner::AppendChild(AppendChild {
    parent_id: "80f4925f-2".to_string(),
    child_source: "div".to_string(),
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div 
      div
    "#
  )]
}

case! {
  can_insert_a_text_node_into_the_document,
  [(
    "/entry.pc", r#"
      div {

      }
    "#
  )],
  mutation::Inner::AppendChild(AppendChild {
    parent_id: "80f4925f-2".to_string(),
    child_source: "text \"something\"".to_string(),
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div 
      text "something"
    "#
  )]
}

case! {
  can_insert_an_element_into_an_element,
  [(
    "/entry.pc", r#"
      div {

      }
    "#
  )],
  mutation::Inner::AppendChild(AppendChild {
    parent_id: "80f4925f-1".to_string(),
    child_source: "text 'something'".to_string(),
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        text "something"
      }
    "#
  )]
}

case! {
  can_change_the_frame_bounds_of_a_document_element,
  [(
    "/entry.pc", r#"
      div
    "#
  )],
  mutation::Inner::SetFrameBounds(SetFrameBounds {
    frame_id: "80f4925f-1".to_string(),
    bounds: Some(Bounds {
      x: 100.0,
      y: 200.0,
      width: 300.0,
      height: 400.0
    })
  }).get_outer(),
  [(
    "/entry.pc", r#"
      /**
       * @bounds(x: 100, y: 200, width: 300, height: 400)
       */
      div
    "#
  )]
}

case! {
  can_remove_a_document_body_item,
  [(
    "/entry.pc", r#"
      div
      text "hello world"
    "#
  )],
  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      text "hello world"
    "#
  )]
}

case! {
  can_remove_an_element_child,
  [(
    "/entry.pc", r#"
      div {
        text "hello world"
      }
    "#
  )],
  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div
    "#
  )]
}

case! {
  can_remove_a_child_from_a_text_node,
  [(
    "/entry.pc", r#"
      text "hello" {
        style {

        }
      }
    "#
  )],
  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      text "hello"
    "#
  )]
}

case! {
  when_deleting_a_frame_the_bounds_are_removed_too,
  [(
    "/entry.pc", r#"
      div {
        style {
          color: orange
        }
      }
      /**
       * @bounds(x:100,y:200,width:300,height:400)
       */
      text "Hello"
    "#
  )],
  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-18".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        style {
          color: orange
        }
      }
    "#
  )]
}

case! {
  can_insert_an_element_within_an_element,
  [(
    "/entry.pc", r#"
      div {
        span {

        }
      }
    "#
  )],
  mutation::Inner::AppendChild(AppendChild {
    parent_id: "80f4925f-1".to_string(),
    child_source: r#"
      div {
        style {
          color: orange
        }
      }
    "#.to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        span {
          div {
            style {
              color: orange
            }
          }
        }
      }
    "#
  )]
}

case! {
  can_set_the_styles_on_an_element,
  [(
    "/entry.pc", r#"
      div {
      }
    "#
  )],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-1".to_string(),
    declarations: vec![
      SetStyleDeclarationValue {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        style {
          background: red
        }
      }
    "#
  )]
}

case! {
  can_update_an_existing_style_on_an_element,
  [(
    "/entry.pc", r#"
      div {
        style {
          background: blue
        }
      }
    "#
  )],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-4".to_string(),
    declarations: vec![
      SetStyleDeclarationValue {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        style {
          background: red
        }
      }
    "#
  )]
}

case! {
  appends_new_styles_to_existing_one,
  [(
    "/entry.pc", r#"
      div {
        style {
          display: block
        }
      }
    "#
  )],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-4".to_string(),
    declarations: vec![
      SetStyleDeclarationValue {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      },
      SetStyleDeclarationValue {
        imports: HashMap::new(),
        name: "opacity".to_string(),
        value: "0.5".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        style {
          display: block
          background: red
          opacity: 0.5
        }
      }
    "#
  )]
}

case! {
  can_remove_declaration_values,
  [(
    "/entry.pc", r#"
      div {
        style {
          display: block
          padding: 10px
          margin: 0px
        }
      }
    "#
  )],
  mutation::Inner::DeleteStyleDeclarations(DeleteStyleDeclarations {
    expression_id: "80f4925f-8".to_string(),
    declaration_names: vec!["margin".to_string()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        style {
          display: block
          padding: 10px
        }
      }
    "#
  )]
}

case! {
  can_import_an_atom_from_another_file,
  [
    (
      "/entry.pc", r#"
        div {
          style {
          }
        }
      "#
    ),
    (
      "/module.pc", r#"
        public token blue01 blue
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-2".to_string(),
    declarations: vec![
      SetStyleDeclarationValue {
        imports: HashMap::from([("$1".to_string(), "/module.pc".to_string())]),
        name: "color".to_string(),
        value: "var($1.blue01)".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "./module.pc" as imp 
      div { 
        style { 
          color: var(imp.blue01) 
        } 
      }
    "#
  )]
}

case! {
  uses_existing_import_when_defining_var,
  [
    (
      "/entry.pc", r#"
        import "/module.pc" as mod
        div {
          style {
          }
        }
      "#
    ),
    (
      "/module.pc", r#"
        public token blue01 blue
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-2".to_string(),
    declarations: vec![
      SetStyleDeclarationValue {
        imports: HashMap::from([("$1".to_string(), "/module.pc".to_string())]),
        name: "color".to_string(),
        value: "var($1.blue01)".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "/module.pc" as mod 
      div { 
        style { 
          color: var(mod.blue01) 
        } 
      }
    "#
  )]
}


case! {
  can_define_styles_on_a_component,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-1".to_string(),
    declarations: vec![
      SetStyleDeclarationValue {
        imports: HashMap::new(),
        name: "color".to_string(),
        value: "blue".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
     component A {
      render div {
        style {
          color: blue
        }
      }
     }
    "#
  )]
}



case! {
  can_set_frame_bounds_on_render_node,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::SetFrameBounds(SetFrameBounds {
    frame_id: "80f4925f-1".to_string(),
    bounds: Some(Bounds {
      x: 100.0,
      y: 200.0,
      width: 300.0,
      height: 400.0
    })
  }).get_outer(),
  [(
    "/entry.pc", r#"
    /** 
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    
     component A {
      render div
     }
    "#
  )]
}

