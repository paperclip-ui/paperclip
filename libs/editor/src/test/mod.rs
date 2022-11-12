use crate::edit_graph;
use futures::executor::block_on;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::{graph, pc};
use paperclip_proto::ast;
use paperclip_proto::ast_mutate::{mutation, AppendChild};
use std::collections::HashMap;

macro_rules! case {
    ($name: ident, $mock_files: expr, $edit: expr, $expected_mock_files: expr) => {
        #[test]
        pub fn $name() {
            let mock_fs = graph::test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }

            edit_graph(&mut graph, &vec![$edit]);

            let edited_docs = graph
                .dependencies
                .iter()
                .map(|(path, dep)| (path.to_string(), pc::serializer::serialize(&dep.document)))
                .collect::<HashMap<String, String>>();

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
    child: Some(ast::pc::node::Inner::Element(ast::pc::Element {
      id: "something".to_string(),
      name: None,
      namespace: None,
      tag_name: "div".to_string(),
      parameters: vec![],
      body: vec![],
      range: None
    }).get_outer())
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
    child: Some(ast::pc::node::Inner::Text(ast::pc::TextNode {
      id: "something".to_string(),
      name: None,
      value: "something".to_string(),
      body: vec![],
      range: None
    }).get_outer())
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
    child: Some(ast::pc::node::Inner::Text(ast::pc::TextNode {
      id: "something".to_string(),
      name: None,
      value: "something".to_string(),
      body: vec![],
      range: None
    }).get_outer())
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div {
        text "something"
      }
    "#
  )]
}
