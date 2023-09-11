use super::edit_graph;
use crate::graph::{load::LoadableGraph, test_utils};
use futures::executor::block_on;
use paperclip_ast_serialize::pc::serialize;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_proto::ast::graph_ext as graph;
use paperclip_proto::ast::pc::{
    component_body_item, node, Component, Element, Render, Slot, TextNode,
};
use paperclip_proto::ast_mutate::{
    mutation, paste_expression, update_variant_trigger, AppendChild, AppendInsert, Bounds,
    ConvertToComponent, ConvertToSlot, DeleteExpression, InsertFrame, MoveExpressionToFile,
    MoveNode, PasteExpression, PrependChild, SetElementParameter, SetFrameBounds, SetId,
    SetStyleDeclaration, SetStyleDeclarationValue, SetStyleDeclarations, SetStyleMixins,
    SetTagName, SetTextNodeValue, ToggleInstanceVariant, UpdateDependencyPath, UpdateVariant,
    WrapInElement,
};
use std::collections::HashMap;

macro_rules! case {
    ($name: ident, $mock_files: expr, $edit: expr, $expected_mock_files: expr) => {
        #[test]
        pub fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();

            for (path, _) in $mock_files {
                block_on(graph.load(&path, &mock_fs)).expect("Unable to load");
            }

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }

            edit_graph(&mut graph, &vec![$edit], &mock_fs).expect("Can't edit graph");

            let edited_docs = graph
                .dependencies
                .iter()
                .map(|(path, dep)| {
                    (
                        path.to_string(),
                        serialize(dep.document.as_ref().expect("Document must exist")),
                    )
                })
                .collect::<HashMap<String, String>>();

            println!("{:#?}", graph.dependencies);

            for (path, content) in $expected_mock_files {
                if let Some(serialized_content) = edited_docs.get(path) {
                    assert_eq!(strip_extra_ws(serialized_content), strip_extra_ws(&content));
                } else {
                    panic!("File {} not found", path);
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
      div unnamed
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
      text unnamed "something"
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
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
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
  can_set_the_declaration_value_of_an_atom,
  [(
    "/entry.pc", r#"
      public token something red
    "#
  )],
  mutation::Inner::SetStyleDeclarationValue(SetStyleDeclarationValue {
    target_id: "80f4925f-2".to_string(),
    value: "blue".to_string(),
    imports: HashMap::new()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public token something blue
    "#
  )]
}

case! {
  imports_doc_when_setting_value_of_atom,
  [(
    "/entry.pc", r#"
      public token something red
    "#
  ), (

    "/module.pc", r#"
      public token something orange
    "#
  )],
  mutation::Inner::SetStyleDeclarationValue(SetStyleDeclarationValue {
    target_id: "80f4925f-2".to_string(),
    value: "var(mod.something)".to_string(),
    imports: HashMap::from([("mod".to_string(), "/module.pc".to_string())])
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "./module.pc" as mod
      public token something var(mod.something)
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
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
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
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      },
      SetStyleDeclaration {
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
  can_delete_a_child_within_an_insert,
  [(
    "/entry.pc", r#"
      div {
        insert a {
          text ""
        }
        insert b {

        }
      }
    "#
  )],
  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      insert a {
      }
      insert b {

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
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::from([("mod".to_string(), "/module.pc".to_string())]),
        name: "color".to_string(),
        value: "var(mod.blue01)".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "./module.pc" as mod
      div {
        style {
          color: var(mod.blue01)
        }
      }
    "#
  )]
}
case! {
  namespace_is_dropped_from_var_decl_if_in_same_file,
  [
    (
      "/entry.pc", r#"

        token blue01 blue

        div {
          style {
          }
        }
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-4".to_string(),
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::from([("mod".to_string(), "/entry.pc".to_string())]),
        name: "color".to_string(),
        value: "var(mod.blue01)".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      token blue01 blue
      div {
        style {
          color: var(blue01)
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
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::from([("mod".to_string(), "/module.pc".to_string())]),
        name: "color".to_string(),
        value: "var(mod.blue01)".to_string()
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
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
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

case! {
  can_add_styles_to_text_nodes,
  [
    (
      "/entry.pc", r#"
        text "hello"
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-1".to_string(),
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "color".to_string(),
        value: "blue".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      text "hello" {
        style {
          color: blue
        }
      }
    "#
  )]
}

case! {
  can_add_a_variant,
  [
    (
      "/entry.pc", r#"
        component Test {

        }
      "#
    )
  ],
  mutation::Inner::UpdateVariant(UpdateVariant {
    component_id: "80f4925f-1".to_string(),
    variant_id: None,
    name: "blah".to_string(),
    triggers: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant blah
      }
    "#
  )]
}

case! {
  can_add_a_variant_with_string_triggers,
  [
    (
      "/entry.pc", r#"
        component Test {

        }
      "#
    )
  ],
  mutation::Inner::UpdateVariant(UpdateVariant {
    component_id: "80f4925f-1".to_string(),
    variant_id: None,
    name: "blah".to_string(),
    triggers: vec![update_variant_trigger::Inner::Str(":nth-child(2n)".to_string()).get_outer()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant blah trigger {
          ":nth-child(2n)"
        }
      }
    "#
  )]
}

case! {
  can_delete_a_variant,
  [
    (
      "/entry.pc", r#"
        component Test {
          variant a
        }
      "#
    )
  ],
  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test { }
    "#
  )]
}

case! {
  variant_name_is_corrected_when_inserting,
  [
    (
      "/entry.pc", r#"
        component Test {
          variant a
        }
      "#
    )
  ],
  mutation::Inner::UpdateVariant(UpdateVariant {
    component_id: "80f4925f-2".to_string(),
    variant_id: None,
    name: "12 abc d $ ! b c e e aadd".to_string(),
    triggers: vec![update_variant_trigger::Inner::Str(".div".to_string()).get_outer()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant abcDBCEEAadd trigger {
          ".div"
        }
        variant a
      }
    "#
  )]
}

case! {
  name_is_changed_if_duplicate,
  [
    (
      "/entry.pc", r#"
        component Test {
          variant a
        }
      "#
    )
  ],
  mutation::Inner::UpdateVariant(UpdateVariant {
    component_id: "80f4925f-2".to_string(),
    variant_id: None,
    name: "a".to_string(),
    triggers: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant a1
        variant a
      }
    "#
  )]
}

case! {
  can_define_a_boolean_trigger,
  [
    (
      "/entry.pc", r#"
        component Test {
        }
      "#
    )
  ],
  mutation::Inner::UpdateVariant(UpdateVariant {
    component_id: "80f4925f-1".to_string(),
    variant_id: None,
    name: "a".to_string(),
    triggers: vec![update_variant_trigger::Inner::Bool(true).get_outer()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant a trigger {
          true
        }
      }
    "#
  )]
}

case! {
  can_set_style_declarations_with_variant_ids,
  [
    (
      "/entry.pc", r#"
        component Test {
          variant a
          variant b
          render div {

          }
        }
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-3".to_string(),
    variant_ids: vec!["80f4925f-1".to_string(), "80f4925f-2".to_string()],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant a
        variant b
        render div {
          style variant a + b {
            background: red
          }
        }
      }
    "#
  )]
}

case! {
  can_set_style_declarations_with_variant_ids_with_existing_style,
  [
    (
      "/entry.pc", r#"
        component Test {
          variant a
          variant b
          render div {
            style {
              background: blue
            }
          }
        }
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-6".to_string(),
    variant_ids: vec!["80f4925f-1".to_string(), "80f4925f-2".to_string()],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant a
        variant b
        render div {
          style variant a + b {
            background: red
          }
          style {
            background: blue
          }
        }
      }
    "#
  )]
}

case! {
  can_set_style_declarations_on_existing_variant,
  [
    (
      "/entry.pc", r#"
        component Test {
          variant a
          render div {
            style variant a {
              background: blue
            }
          }
        }
      "#
    )
  ],
  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-6".to_string(),
    variant_ids: vec!["80f4925f-1".to_string()],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component Test {
        variant a
        render div {
          style variant a {
            background: red
          }
        }
      }
    "#
  )]
}

case! {
  can_convert_an_element_to_a_component,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],
  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public component Unnamed {
        render div
      }
    "#
  )]
}

case! {
  can_convert_a_text_node_to_an_element,
  [
    (
      "/entry.pc", r#"
        text "ab"
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
        public component Unnamed {
          render text "ab"
        }
    "#
  )]
}

case! {
  inserts_new_components_after_imports,
  [
    (
      "/entry.pc", r#"
        import "/a.pc" as ab
        div
      "#
    ),
    (
      "/a.pc", r#"
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-2".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "/a.pc" as ab
      public component Unnamed {
        render div
      }
    "#
  )]
}

case! {
  inserts_new_components_where_components_start,
  [
    (
      "/entry.pc", r#"
        public token ab #F60
        public style test {
          color: blue
        }
        div {
          style {
            color: blue
          }
        }
        component Ab {
          render span
        }
      "#
    ),
    (
      "/a.pc", r#"
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-9".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public token ab #F60
      public style test {
        color: blue
      }

      public component Unnamed {
        render div {
          style {
            color: blue
          }
        }
      }

      component Ab {
        render span
      }
    "#
  )]
}

case! {
  can_convert_a_nested_element_to_component,
  [
    (
      "/entry.pc", r#"
        div {
          text "something"
        }
      "#
    ),
    (
      "/a.pc", r#"
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public component Unnamed {
        render text "something"
      }
      div {
        Unnamed
      }
    "#
  )]
}

case! {
  can_convert_nested_slot_child_to_component,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot children {
            div
          }
        }
      "#
    ),
    (
      "/a.pc", r#"
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public component Unnamed {
        render div
      }

      component A {
        render slot children {
          Unnamed
        }
      }
    "#
  )]
}

case! {
  can_convert_a_child_of_insert_to_component,
  [
    (
      "/entry.pc", r#"
        A {
          insert children {
            div
          }
        }
      "#
    ),
    (
      "/a.pc", r#"
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public component Unnamed {
        render div
      }

      A {
        insert children {
          Unnamed
        }
      }
    "#
  )]
}

case! {
  can_convert_a_render_node_to_component,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    public component Unnamed {
      render div
    }

      component A {
        render Unnamed
      }
    "#
  )]
}

case! {
  can_convert_an_element_to_component_and_maintain_id,
  [
    (
      "/entry.pc", r#"
        component B {
          render div test
        }
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    public component Test { render div test } component B { render Test }
    "#
  )]
}

case! {
  can_convert_a_text_node_to_component_and_maintain_id,
  [
    (
      "/entry.pc", r#"
        component B {
          render text abc "blarg"
        }
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: None,
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    public component Abc { render text abc "blarg" } component B { render Abc }
    "#
  )]
}

case! {
  can_convert_component_with_a_name,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],

  mutation::Inner::ConvertToComponent(ConvertToComponent {
    name: Some("abba".to_string()),
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      public component Abba {
        render div
      }
    "#
  )]
}

case! {
  can_convert_an_element_to_a_slot,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::ConvertToSlot(ConvertToSlot {
    expression_id: "80f4925f-1".to_string(),
    name: "children".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render slot children {
          div
        }
      }
    "#
  )]
}

case! {
  finds_unique_name_if_slot_already_exists,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot children {
            div
          }
        }
      "#
    )
  ],

  mutation::Inner::ConvertToSlot(ConvertToSlot {
    expression_id: "80f4925f-1".to_string(),
    name: "children".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render slot children {
          slot children1 {
            div
          }
        }
      }
    "#
  )]
}

case! {
  can_convert_a_text_node_into_a_slot,
  [
    (
      "/entry.pc", r#"
        component A {
          render text "ab"
        }
      "#
    )
  ],

  mutation::Inner::ConvertToSlot(ConvertToSlot {
    expression_id: "80f4925f-1".to_string(),
    name: "child".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render slot child {
          text "ab"
        }
      }
    "#
  )]
}

case! {
  can_convert_a_child_of_insert_into_a_slot,
  [
    (
      "/entry.pc", r#"
        component A {
          render B {
            insert children {
              div
            }
          }
        }
      "#
    )
  ],

  mutation::Inner::ConvertToSlot(ConvertToSlot {
    expression_id: "80f4925f-1".to_string(),
    name: "children".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render B {
          insert children {
            slot children {
              div
            }
          }
        }
      }
    "#
  )]
}

case! {
  can_convert_a_child_of_element_into_a_slot,
  [
    (
      "/entry.pc", r#"
        component A {
          render div {
            text "a"
          }
        }
      "#
    )
  ],

  mutation::Inner::ConvertToSlot(ConvertToSlot {
    expression_id: "80f4925f-1".to_string(),
    name: "children".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render div {
          slot children {
            text "a"
          }
        }
      }
    "#
  )]
}

case! {
  can_delete_a_child_of_a_slot,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot children {
            text "a"
          }
        }
      "#
    )
  ],

  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render slot children
      }
    "#
  )]
}

case! {
  can_import_a_frame,
  [
    (
      "/entry.pc", r#"
      "#
    ),
    (
      "/test.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::InsertFrame(InsertFrame {
    node_source: "mod.A".to_string(),
    bounds: Some(Bounds {
      x: 100.0,
      y: 200.0,
      width: 300.0,
      height: 400.0
    }),
    document_id: "80f4925f-1".to_string(),
    imports: HashMap::from([("mod".to_string(), "/test.pc".to_string())])
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "./test.pc" as mod
      /**
       * @bounds(x: 100, y: 200, width: 300, height: 400)
       */
      mod.A
    "#
  )]
}

case! {
  re_uses_import_if_exists,
  [
    (
      "/entry.pc", r#"
        import "/test.pc" as imp
      "#
    ),
    (
      "/test.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::InsertFrame(InsertFrame {
    node_source: "mod.A".to_string(),
    bounds: Some(Bounds {
      x: 100.0,
      y: 200.0,
      width: 300.0,
      height: 400.0
    }),
    document_id: "80f4925f-2".to_string(),
    imports: HashMap::from([("mod".to_string(), "/test.pc".to_string())])
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "/test.pc" as imp
      /**
       * @bounds(x: 100, y: 200, width: 300, height: 400)
       */
      imp.A
    "#
  )]
}

case! {
  uses_unique_namespace,
  [
    (
      "/entry.pc", r#"
        import "/test2.pc" as mod
      "#
    ),
    (
      "/test.pc", r#"
        component A {
          render div
        }
      "#
    ),
    (
      "/test2.pc", r#"

      "#
    )
  ],

  mutation::Inner::InsertFrame(InsertFrame {
    node_source: "mod.A".to_string(),
    bounds: Some(Bounds {
      x: 100.0,
      y: 200.0,
      width: 300.0,
      height: 400.0
    }),
    document_id: "80f4925f-2".to_string(),
    imports: HashMap::from([("mod".to_string(), "/test.pc".to_string())])
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "./test.pc" as mod1
      import "/test2.pc" as mod
      /**
       * @bounds(x: 100, y: 200, width: 300, height: 400)
       */
      mod1.A
    "#
  )]
}

case! {
  if_inserting_frame_of_component_in_same_doc_the_namespace_is_dropped,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::InsertFrame(InsertFrame {
    node_source: "mod.A".to_string(),
    bounds: Some(Bounds {
      x: 100.0,
      y: 200.0,
      width: 300.0,
      height: 400.0
    }),
    document_id: "80f4925f-4".to_string(),
    imports: HashMap::from([("mod".to_string(), "/entry.pc".to_string())])
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
        render div
      }

      /**
       * @bounds(x: 100, y: 200, width: 300, height: 400)
       */
      A
    "#
  )]
}

case! {
  can_delete_the_render_node,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"

      component A {
      }
    "#
  )]
}

case! {
  can_change_the_value_of_a_text_expr,
  [
    (
      "/entry.pc", r#"
        text "a"
      "#
    )
  ],

  mutation::Inner::SetTextNodeValue(SetTextNodeValue {
    text_node_id: "80f4925f-1".to_string(),
    value: "b".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      text "b"
    "#
  )]
}

case! {
  can_change_the_id_of_an_element,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-1".to_string(),
    value: "a".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      div a
    "#
  )]
}

case! {
  can_change_the_id_of_a_text_node,
  [
    (
      "/entry.pc", r#"
        text "a"
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-1".to_string(),
    value: "a".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      text a "a"
    "#
  )]
}

case! {
  can_change_the_id_of_a_component,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-3".to_string(),
    value: "B".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component B {
        render div
      }
    "#
  )]
}

case! {
  can_change_the_id_of_an_atom,
  [
    (
      "/entry.pc", r#"
        token a blue
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-2".to_string(),
    value: "b".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      token b blue
    "#
  )]
}

case! {
  can_change_the_id_of_a_style,
  [
    (
      "/entry.pc", r#"
        style a
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-1".to_string(),
    value: "b".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      style b
    "#
  )]
}

case! {
  can_change_the_id_of_a_trigger,
  [
    (
      "/entry.pc", r#"
        trigger a {
          ":nth-child(2n)"
        }
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-2".to_string(),
    value: "b".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      trigger a {
        ":nth-child(2n)"
      }
    "#
  )]
}

case! {
  ensures_that_ids_are_safe_when_set,
  [
    (
      "/entry.pc", r#"
        style a
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-1".to_string(),
    value: "this is an id".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      style thisIsAnId
    "#
  )]
}

case! {
  when_id_set_an_component_assoc_instances_are_changed_in_same_doc,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }

        A
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-3".to_string(),
    value: "B".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component B {
        render div
      }

      B
    "#
  )]
}

case! {
  when_id_set_an_component_assoc_instances_are_changed_in_another_doc,
  [
    (
      "/entry.pc", r#"
        import "/test.pc" as ent

        ent.A
      "#
    ),
    (
      "/test.pc", r#"
        public component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "6bcf0994-3".to_string(),
    value: "B".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      import "/test.pc" as ent
      ent.B
    "#
  )]
}

case! {
  picks_a_unique_id,
  [
    (
      "/entry.pc", r#"
        component B {
          render div
        }
        component A {
          render div
        }
        A
      "#
    ),
    (
      "/test.pc", r#"
        public component A {
          render div
        }
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-6".to_string(),
    value: "B".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component B {
        render div
      }
      component B1 {
        render div
      }
      B1
    "#
  )]
}

case! {
  does_not_pick_uid_if_target_name_is_same,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
        A
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-3".to_string(),
    value: "A".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component A {
        render div
      }
      A
    "#
  )]
}

case! {
  can_rename_a_slot_id,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot test {

          }
        }
      "#
    )
  ],

  mutation::Inner::SetId(SetId {
    expression_id: "80f4925f-1".to_string(),
    value: "test2".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component A {
        render slot test2
      }
    "#
  )]
}

case! {
  can_append_an_insert,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot test
        }

        A
      "#
    )
  ],

  mutation::Inner::AppendInsert(AppendInsert {
    instance_id: "80f4925f-4".to_string(),
    slot_name: "test".to_string(),
    child_source: r#"
      text "abba" {
        style {
          color: blue
        }
      }
    "#.to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component A {
        render slot test
      }
      A {
        insert test {
          text "abba" {
            style {
              color: blue
            }
          }
        }
      }
    "#
  )]
}

case! {
  can_append_to_an_existing_insert,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot test
        }

        A {
          insert test {
            div
          }
        }
      "#
    )
  ],

  mutation::Inner::AppendInsert(AppendInsert {
    instance_id: "80f4925f-6".to_string(),
    slot_name: "test".to_string(),
    child_source: r#"
      text "abba" {
        style {
          color: blue
        }
      }
    "#.to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component A {
        render slot test
      }
      A {
        insert test {
          div
          text "abba" {
            style {
              color: blue
            }
          }
        }
      }
    "#
  )]
}

case! {
  can_delete_an_expr_from_an_insert,
  [
    (
      "/entry.pc", r#"
        component A {
          render slot test
        }

        A {
          insert test {
            div
          }
        }
      "#
    )
  ],

  mutation::Inner::DeleteExpression(DeleteExpression {
    expression_id: "80f4925f-4".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
      component A {
        render slot test
      }
      A {
        insert test {

        }
      }
    "#
  )]
}

case! {
  can_move_a_text_node_inside_an_element,
  [
    (
      "/entry.pc", r#"
        div {
          span
          text "b"
        }
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 2,
    target_id: "80f4925f-1".to_string(),
    node_id: "80f4925f-2".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      span {
        text "b"
      }
    }
    "#
  )]
}

case! {
  can_move_a_text_node_before_another,
  [
    (
      "/entry.pc", r#"
        div {
          span
          text "b"
        }
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 0,
    target_id: "80f4925f-1".to_string(),
    node_id: "80f4925f-2".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      text "b"
      span
    }
    "#
  )]
}

case! {
  can_move_a_text_node_after_another,
  [
    (
      "/entry.pc", r#"
        div {
          text "b"
          span
        }
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 1,
    target_id: "80f4925f-2".to_string(),
    node_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      span
      text "b"
    }
    "#
  )]
}

case! {
  can_move_an_element_inside_after_element,
  [
    (
      "/entry.pc", r#"
        div {
          a
          b
        }
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 1,
    target_id: "80f4925f-2".to_string(),
    node_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      b
      a
    }
    "#
  )]
}

case! {
  can_move_an_element_into_the_document,
  [
    (
      "/entry.pc", r#"
        div {
          a
          b
        }
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 2,
    target_id: "80f4925f-4".to_string(),
    node_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      b
    }
    a
    "#
  )]
}

case! {
  moves_metadata_with_insert_before,
  [
    (
      "/entry.pc", r#"
        a

        /**
         * @bounds(x: 100, y: 200, width: 300, height: 400)
         */
        b
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 0,
    target_id: "80f4925f-1".to_string(),
    node_id: "80f4925f-15".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    /**
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    b
    a
    "#
  )]
}

case! {
  moves_metadata_with_insert_after,
  [
    (
      "/entry.pc", r#"
        /**
         * @bounds(x: 100, y: 200, width: 300, height: 400)
         */
        a

        b
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 1,
    target_id: "80f4925f-15".to_string(),
    node_id: "80f4925f-14".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    b
    /**
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    a
    "#
  )]
}

case! {
  moves_node_before_metadata_with_before_insert,
  [
    (
      "/entry.pc", r#"

        /**
         * @bounds(x: 100, y: 200, width: 300, height: 400)
         */
        a

        /**
         * @bounds(x: 100, y: 200, width: 300, height: 400)
         */
        b
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 0,
    target_id: "80f4925f-14".to_string(),
    node_id: "80f4925f-28".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"


    /**
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    b

    /**
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    a
    "#
  )]
}

case! {
  moves_node_before_metadata_with_after_insert,
  [
    (
      "/entry.pc", r#"

        /**
         * @bounds(x: 100, y: 200, width: 300, height: 400)
         */
        a

        /**
         * @bounds(x: 100, y: 200, width: 300, height: 400)
         */
        b
      "#
    )
  ],

  mutation::Inner::MoveNode(MoveNode {
    position: 1,
    target_id: "80f4925f-28".to_string(),
    node_id: "80f4925f-14".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"


    /**
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    b

    /**
     * @bounds(x: 100, y: 200, width: 300, height: 400)
     */
    a
    "#
  )]
}

case! {
  can_wrap_a_text_node_in_an_element,
  [
    (
      "/entry.pc", r#"
        text "hello"
      "#
    )
  ],

  mutation::Inner::WrapInElement(WrapInElement {
    target_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      text "hello"
    }
    "#
  )]
}

case! {
  can_wrap_a_nested_text_node,
  [
    (
      "/entry.pc", r#"
        div {
          text "hello"
        }
      "#
    )
  ],


  mutation::Inner::WrapInElement(WrapInElement {
    target_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      div {
        text "hello"
      }
    }
    "#
  )]
}

case! {
  can_set_the_tag_name_of_element,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],


  mutation::Inner::SetTagName(SetTagName {
    element_id: "80f4925f-1".to_string(),
    tag_name: "span".to_string(),
    tag_file_path: None
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span
    "#
  )]
}

case! {
  can_paste_an_element_into_another_element,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],


  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-1".to_string(),
    item: Some(paste_expression::Item::Element(Element {
      namespace: None,
      name: None,
      comment: None,
      parameters: vec![],
      range: None,
      body: vec![],
      tag_name: "span".to_string(),
      id: "123".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      span
    }
    "#
  )]
}

case! {
  can_paste_an_element_into_the_document,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],


  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-2".to_string(),
    item: Some(paste_expression::Item::Element(Element {
      namespace: None,
      name: None,
      comment: None,
      parameters: vec![],
      range: None,
      body: vec![],
      tag_name: "span".to_string(),
      id: "123".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div
    span
    "#
  )]
}

case! {
  can_paste_a_text_node_into_the_document,
  [
    (
      "/entry.pc", r#"
        div
      "#
    )
  ],


  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-2".to_string(),
    item: Some(paste_expression::Item::TextNode(TextNode {
      name: None,
      comment: None,
      range: None,
      body: vec![],
      value: "span".to_string(),
      id: "123".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div
    text "span"
    "#
  )]
}

case! {
  can_drop_a_node_into_a_slot,
  [
    (
      "/entry.pc", r#"
        component A {
          render div {
            slot children {
              text "a"
            }
          }
        }
        text "b"
      "#
    )
  ],
  mutation::Inner::MoveNode(MoveNode {
    position: 2,
    target_id: "80f4925f-2".to_string(),
    node_id: "80f4925f-6".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        slot children {
          text "a"
          text "b"
        }
      }
    }
    "#
  )]
}

case! {
  can_drop_a_node_into_an_insert,
  [
    (
      "/entry.pc", r#"
        A {
          insert children {
            text "a"
          }
        }
        text "b"
      "#
    )
  ],
  mutation::Inner::MoveNode(MoveNode {
    position: 2,
    target_id: "80f4925f-2".to_string(),
    node_id: "80f4925f-4".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    A {
      insert children {
        text "a"
        text "b"
      }
    }
    "#
  )]
}

case! {
  can_paste_a_node_to_a_slot,
  [
    (
      "/entry.pc", r#"
      component A {
        render div {
          slot children {
            text "a"
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-2".to_string(),
    item: Some(paste_expression::Item::Element(Element {
      namespace: None,
      comment: None,
      name: None,
      parameters: vec![],
      range: None,
      body: vec![],
      tag_name: "span".to_string(),
      id: "123".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        slot children {
          text "a"
          span
        }
      }
    }
    "#
  )]
}

case! {
  can_paste_a_node_to_an_insert,
  [
    (
      "/entry.pc", r#"
      A {
        insert children {
          text "a"
        }
      }
      "#
    )
  ],
  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-2".to_string(),
    item: Some(paste_expression::Item::Element(Element {
      namespace: None,
      name: None,
      comment: None,
      parameters: vec![],
      range: None,
      body: vec![],
      tag_name: "span".to_string(),
      id: "123".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    A {
      insert children {
        text "a"
        span
      }
    }
    "#
  )]
}

case! {
  can_toggle_an_instance_variant,
  [
    (
      "/entry.pc", r#"
      component A {
        variant a
        render div {
          style variant a {
            color: red
          }
        }
      }

      A
      "#
    )
  ],
  mutation::Inner::ToggleInstanceVariant(ToggleInstanceVariant {
    instance_id: "80f4925f-9".to_string(),
    variant_id: "80f4925f-1".to_string(),
    combo_variant_ids: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      variant a
      render div {
        style variant a {
          color: red
        }
      }
    }

    A {
      override {
        variant a trigger {
          true
        }
      }
    }
    "#
  )]
}

case! {
  can_disable_an_instance_variant,
  [
    (
      "/entry.pc", r#"
      component A {
        variant a
        render div {
          style variant a {
            color: red
          }
        }
      }

      A {
        override {
          variant a trigger {
            true
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::ToggleInstanceVariant(ToggleInstanceVariant {
    instance_id: "80f4925f-13".to_string(),
    variant_id: "80f4925f-1".to_string(),
    combo_variant_ids: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      variant a
      render div {
        style variant a {
          color: red
        }
      }
    }

    A {
      override {
        variant a
      }
    }
    "#
  )]
}

case! {
  can_enable_an_instance_variant_in_a_variant,
  [
    (
      "/entry.pc", r#"
      component A {
        variant a
        render div {
          style variant a {
            color: red
          }
        }
      }

      component B {
        variant b
        render A
      }
      "#
    )
  ],
  mutation::Inner::ToggleInstanceVariant(ToggleInstanceVariant {
    instance_id: "80f4925f-10".to_string(),
    variant_id: "80f4925f-1".to_string(),
    combo_variant_ids: vec!["80f4925f-9".to_string()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      variant a
      render div {
        style variant a {
          color: red
        }
      }
    }

    component B {
      variant b
      render A {
        override {
          variant a trigger {
            b
          }
        }
      }
    }
    "#
  )]
}

case! {
  can_disable_an_instance_variant_in_a_variant,
  [
    (
      "/entry.pc", r#"
      component A {
        variant a
        render div {
          style variant a {
            color: red
          }
        }
      }

      component B {
        variant b
        render A {
          override {
            variant a trigger {
              b
            }
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::ToggleInstanceVariant(ToggleInstanceVariant {
    instance_id: "80f4925f-14".to_string(),
    variant_id: "80f4925f-1".to_string(),
    combo_variant_ids: vec!["80f4925f-9".to_string()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      variant a
      render div {
        style variant a {
          color: red
        }
      }
    }

    component B {
      variant b
      render A {
        override {
          variant a
        }
      }
    }
    "#
  )]
}

case! {
  removes_dupe_triggers,
  [
    (
      "/entry.pc", r#"
      component A {
        variant a
        render div {
          style variant a {
            color: red
          }
        }
      }

      component B {
        variant b
        render A {
          override {
            variant a trigger {
              b
              b
              b
            }
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::ToggleInstanceVariant(ToggleInstanceVariant {
    instance_id: "80f4925f-18".to_string(),
    variant_id: "80f4925f-1".to_string(),
    combo_variant_ids: vec!["80f4925f-9".to_string()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      variant a
      render div {
        style variant a {
          color: red
        }
      }
    }

    component B {
      variant b
      render A {
        override {
          variant a
        }
      }
    }
    "#
  )]
}

case! {
  defines_render_expr_if_dropped_in_component,
  [
    (
      "/entry.pc", r#"
      component A {

      }
      div
      "#
    )
  ],
  mutation::Inner::MoveNode(MoveNode {
    position: 2,
    target_id: "80f4925f-1".to_string(),
    node_id: "80f4925f-2".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div
    }
    "#
  )]
}

case! {
  defines_render_expr_if_text_node_dropped_in_component,
  [
    (
      "/entry.pc", r#"
      component A {

      }
      text "a"
      "#
    )
  ],
  mutation::Inner::MoveNode(MoveNode {
    position: 2,
    target_id: "80f4925f-1".to_string(),
    node_id: "80f4925f-2".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render text "a"
    }
    "#
  )]
}

case! {
  can_add_a_style_mixin,
  [
    (
      "/entry.pc", r#"
      style a {

      }

      style b {

      }
      "#
    )
  ],
  mutation::Inner::SetStyleMixins(SetStyleMixins {
    target_expr_id: "80f4925f-2".to_string(),
    mixin_ids: vec!["80f4925f-1".to_string()],
    variant_ids: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    style a
    style b extends a
    "#
  )]
}

case! {
  setting_style_mixins_resets_styles,
  [
    (
      "/entry.pc", r#"

      style a {

      }
      style b {

      }

      style c extends b {

      }
      "#
    )
  ],
  mutation::Inner::SetStyleMixins(SetStyleMixins {
    target_expr_id: "80f4925f-4".to_string(),
    mixin_ids: vec!["80f4925f-1".to_string()],
    variant_ids: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    style a
    style b
    style c extends a
    "#
  )]
}

case! {
  auto_imports_style_from_other_dep,
  [
    (
      "/entry.pc", r#"
      style a
      "#
    ),
    (
      "/theme.pc", r#"
      public style test {
        color: red
      }
      "#
    )
  ],
  mutation::Inner::SetStyleMixins(SetStyleMixins {
    target_expr_id: "80f4925f-1".to_string(),
    mixin_ids: vec!["63c0af9a-3".to_string()],
    variant_ids: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    import "./theme.pc" as module
    style a extends module.test
    "#
  )]
}

case! {
  can_define_mixins_on_an_element_without_a_style,
  [
    (
      "/entry.pc", r#"
      style a {
        color: blue
      }
      div
      "#
    )
  ],
  mutation::Inner::SetStyleMixins(SetStyleMixins {
    target_expr_id: "80f4925f-4".to_string(),
    mixin_ids: vec!["80f4925f-3".to_string()],
    variant_ids: vec![]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    style a {
      color: blue
    }
    div {
      style extends a
    }
    "#
  )]
}

case! {
  can_define_mixins_within_variant,
  [
    (
      "/entry.pc", r#"
      style a
      component B {
        variant bv
        render div {

        }
      }
      "#
    )
  ],
  mutation::Inner::SetStyleMixins(SetStyleMixins {
    target_expr_id: "80f4925f-3".to_string(),
    mixin_ids: vec!["80f4925f-1".to_string()],
    variant_ids: vec!["80f4925f-2".to_string()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    style a
      component B {
        variant bv
        render div {
          style variant bv extends a
        }
      }
    "#
  )]
}

case! {
  can_define_mixins_for_existing_style_with_variant,
  [
    (
      "/entry.pc", r#"
      style a
      component B {
        variant bv
        render div {
          style variant bv {
            color: blue
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::SetStyleMixins(SetStyleMixins {
    target_expr_id: "80f4925f-7".to_string(),
    mixin_ids: vec!["80f4925f-1".to_string()],
    variant_ids: vec!["80f4925f-2".to_string()]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    style a
      component B {
        variant bv
        render div {
          style variant bv extends a {
            color: blue
          }
        }
      }
    "#
  )]
}

case! {
  moves_node_to_render_node_if_dropped_in_component,
  [
    (
      "/entry.pc", r#"
      component A {
        render div
      }
      span
      "#
    )
  ],
  mutation::Inner::MoveNode(MoveNode {
    target_id: "80f4925f-3".to_string(),
    position: 2,
    node_id: "80f4925f-4".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        span
      }
    }
    "#
  )]
}

case! {
  can_move_a_node_before_a_component,
  [
    (
      "/entry.pc", r#"
      component A {
        render div
      }
      span
      "#
    )
  ],
  mutation::Inner::MoveNode(MoveNode {
    target_id: "80f4925f-3".to_string(),
    position: 0,
    node_id: "80f4925f-4".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span
    component A {
      render div
    }
    "#
  )]
}

case! {
  sets_style_on_render_node_if_expr_is_component,
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
    expression_id: "80f4925f-3".to_string(),
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "background".to_string(),
        value: "red".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        style {
          background: red
        }
      }
    }
    "#
  )]
}

case! {
  removes_style_declarations_that_are_empty,
  [
    (
      "/entry.pc", r#"
      div {
        style {
          color: blue
          background: orange
        }
      }
      "#
    )
  ],

  mutation::Inner::SetStyleDeclarations(SetStyleDeclarations {
    expression_id: "80f4925f-6".to_string(),
    variant_ids: vec![],
    declarations: vec![
      SetStyleDeclaration {
        imports: HashMap::new(),
        name: "color".to_string(),
        value: "".to_string()
      }
    ]
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      style {
        background: orange
      }
    }
    "#
  )]
}

case! {
  creates_instance_of_pasted_component,
  [
    (
      "/entry.pc", r#"
      component A {
        render div
      }
      "#
    )
  ],
  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-4".to_string(),
    item: Some(paste_expression::Item::Component(Component {
      name: "Baaabbb".to_string(),
      is_public: false,
      comment: None,
      range: None,
      body: vec![],
      id: "80f4925f-3".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div
    }
    A
    "#
  )]
}

case! {
  imports_pasted_instance_from_other_doc,
  [
    (
      "/entry.pc", r#"
      "#
    ),
    (

      "/module.pc", r#"
      component A {
        render div
      }
      "#
    )
  ],
  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-1".to_string(),
    item: Some(paste_expression::Item::Component(Component {
      name: "A".to_string(),
      is_public: false,
      comment: None,
      range: None,
      body: vec![],
      id: "139cec8e-3".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    import "./module.pc" as module
    module.A
    "#
  )]
}

case! {
  can_wrap_a_node_within_an_insert,
  [
    (
      "/entry.pc", r#"
      component A {
        render div {
          insert a {
            text "blah"
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::WrapInElement(WrapInElement {
    target_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        insert a {
          div {
            text "blah"
          }
        }
      }
    }
    "#
  )]
}

case! {
  can_wrap_a_node_within_a_slot,
  [
    (
      "/entry.pc", r#"
      component A {
        render div {
          slot a {
            text "blah"
          }
        }
      }
      "#
    )
  ],
  mutation::Inner::WrapInElement(WrapInElement {
    target_id: "80f4925f-1".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        slot a {
          div {
            text "blah"
          }
        }
      }
    }
    "#
  )]
}

case! {
  can_set_the_tag_name_of_a_component,
  [
    (
      "/entry.pc", r#"
      component A {
        render div
      }
      "#
    )
  ],
  mutation::Inner::SetTagName(SetTagName {
    element_id: "80f4925f-3".to_string(),
    tag_name: "span".to_string(),
    tag_file_path: None
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render span
    }
    "#
  )]
}

case! {
  can_set_the_tag_name_of_a_component_that_doesnt_have_a_render_node,
  [
    (
      "/entry.pc", r#"
      component A {
      }
      "#
    )
  ],
  mutation::Inner::SetTagName(SetTagName {
    element_id: "80f4925f-1".to_string(),
    tag_name: "span".to_string(),
    tag_file_path: None
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render span
    }
    "#
  )]
}

case! {
  can_prepend_a_child_in_a_document,
  [
    (
      "/entry.pc", r#"
      component A {
      }
      "#
    )
  ],
  mutation::Inner::PrependChild(PrependChild {
    parent_id: "80f4925f-2".to_string(),
    child_source: "span".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span unnamed
    component A {
    }
    "#
  )]
}

case! {
  can_prepend_a_child_to_a_component_without_render_node,
  [
    (
      "/entry.pc", r#"
      component A {
      }
      "#
    )
  ],
  mutation::Inner::PrependChild(PrependChild {
    parent_id: "80f4925f-1".to_string(),
    child_source: "span".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        span
      }
    }
    "#
  )]
}

case! {
  can_prepend_a_child_in_an_insert,
  [
    (
      "/entry.pc", r#"
      div {
        insert a {

        }
      }
      "#
    )
  ],
  mutation::Inner::PrependChild(PrependChild {
    parent_id: "80f4925f-1".to_string(),
    child_source: "span".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      insert a {
        span
      }
    }
    "#
  )]
}

case! {
  can_prepend_a_child_in_a_slot,
  [
    (
      "/entry.pc", r#"
      div {
        slot a {

        }
      }
      "#
    )
  ],
  mutation::Inner::PrependChild(PrependChild {
    parent_id: "80f4925f-1".to_string(),
    child_source: "span".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    div {
      slot a {
        span
      }
    }
    "#
  )]
}

case! {
  creates_unique_id_when_prepending_node,
  [
    (
      "/entry.pc", r#"
      span a
      component A {
      }
      "#
    )
  ],
  mutation::Inner::PrependChild(PrependChild {
    parent_id: "80f4925f-3".to_string(),
    child_source: "span a".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span a1
    span a
    component A {
    }
    "#
  )]
}

case! {
  can_change_a_tag_to_an_instance_from_another_doc,
  [
    (
      "/entry.pc", r#"
        public component A {
          render div
        }

        span
      "#
    ),
    (
      "/test.pc", r#"
        public component B {
          render div
        }
      "#
    )
  ],


  mutation::Inner::SetTagName(SetTagName {
    element_id: "80f4925f-4".to_string(),
    tag_name: "B".to_string(),
    tag_file_path: Some("/test.pc".to_string())
  }).get_outer(),
  [(
    "/entry.pc", r#"
    import "./test.pc" as module
    public component A {
      render div
    }

    module.B
    "#
  )]
}

case! {
  can_change_a_tag_to_an_instance_from_same_doc,
  [
    (
      "/entry.pc", r#"
        public component A {
          render div
        }

        span
      "#
    ),
    (
      "/test.pc", r#"
        public component B {
          render div
        }
      "#
    )
  ],


  mutation::Inner::SetTagName(SetTagName {
    element_id: "80f4925f-4".to_string(),
    tag_name: "A".to_string(),
    tag_file_path: Some("/entry.pc".to_string())
  }).get_outer(),
  [(
    "/entry.pc", r#"
    public component A {
      render div
    }

    A
    "#
  )]
}
case! {
  can_add_a_str_parameter,
  [
    (
      "/entry.pc", r#"
        span
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-1".to_string(),
    parameter_id: None,
    parameter_name: "a".to_string(),
    parameter_value: "\"abba\"".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span(a: "abba")
    "#
  )]
}

case! {
  can_add_a_ref_parameter,
  [
    (
      "/entry.pc", r#"
        span
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-1".to_string(),
    parameter_id: None,
    parameter_name: "a".to_string(),
    parameter_value: "abba".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span(a: abba)
    "#
  )]
}

case! {
  can_add_a_bool_parameter,
  [
    (
      "/entry.pc", r#"
        span
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-1".to_string(),
    parameter_id: None,
    parameter_name: "a".to_string(),
    parameter_value: "false".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span(a: false)
    "#
  )]
}

case! {
  can_change_an_existing_parameter,
  [
    (
      "/entry.pc", r#"
        span(a: "abba")
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-3".to_string(),
    parameter_id: Some("80f4925f-2".to_string()),
    parameter_name: "a".to_string(),
    parameter_value: "baab".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span(a: baab)
    "#
  )]
}

case! {
  removes_a_param_if_the_value_is_empty,
  [
    (
      "/entry.pc", r#"
        span(a: "abba")
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-3".to_string(),
    parameter_id: Some("80f4925f-2".to_string()),
    parameter_name: "a".to_string(),
    parameter_value: "".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    span
    "#
  )]
}

case! {
  can_set_attributes_on_components,
  [
    (
      "/entry.pc", r#"
        component A {
          render div
        }
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-3".to_string(),
    parameter_id: None,
    parameter_name: "a".to_string(),
    parameter_value: "b".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div(a: b)
    }
    "#
  )]
}

case! {
  can_set_attributes_on_components_without_render_node,
  [
    (
      "/entry.pc", r#"
        component A {
        }
      "#
    )
  ],


  mutation::Inner::SetElementParameter(SetElementParameter {
    target_id: "80f4925f-1".to_string(),
    parameter_id: None,
    parameter_name: "a".to_string(),
    parameter_value: "b".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div(a: b)
    }
    "#
  )]
}

case! {
  when_setting_tag_to_instance_slot_children_are_added,
  [
    (
      "/entry.pc", r#"
        component A {
          render div {
            slot a {

            }
            slot b {

            }
          }
        }

        div
      "#
    )
  ],


  mutation::Inner::SetTagName(SetTagName {
    element_id: "80f4925f-6".to_string(),
    tag_name: "A".to_string(),
    tag_file_path: None
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        slot a
        slot b
      }
    }

    A {
      insert a { }
      insert b { }
    }
    "#
  )]
}

case! {
  when_pasting_component_slots_are_created_too,
  [
    (
      "/entry.pc", r#"
      component A {
        render div {
          slot a
          slot b
        }
      }
      "#
    )
  ],
  mutation::Inner::PasteExpression(PasteExpression {
    target_expression_id: "80f4925f-6".to_string(),
    item: Some(paste_expression::Item::Component(Component {
      name: "Baaabbb".to_string(),
      comment: None,
      is_public: false,
      range: None,
      body: vec![
        component_body_item::Inner::Render(Render {
          id: "render".to_string(),
          range: None,
          node: Some(node::Inner::Element(Element {
            id: "div".to_string(),
            comment: None,
            tag_name: "div".to_string(),
            namespace: None,
            name: None,
            parameters: vec![],
            range: None,
            body: vec![
              node::Inner::Slot(Slot {
                range: None,
                id: "slot-1".to_string(),
                name: "a".to_string(),
                body: vec![]
              }).get_outer(),
              node::Inner::Slot(Slot {
                range: None,
                id: "slot-2".to_string(),
                name: "b".to_string(),
                body: vec![]
              }).get_outer()
            ]
          }).get_outer())
        }).get_outer()
      ],
      id: "80f4925f-5".to_string()
    }))
  }).get_outer(),
  [(
    "/entry.pc", r#"
    component A {
      render div {
        slot a
        slot b
      }
    }
    A {
      insert a { }
      insert b { }
    }
    "#
  )]
}

case! {
  can_update_the_imports_if_file_moved,
  [
    (
      "/entry.pc", r#"
      import "/some/module.pc" as mod

      component A {
      }
      "#
    ),
    (
      "/some/module.pc", r#"

      component B {
      }
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/some/module.pc".to_string(),
      new_path: "/some/dir/module2.pc".to_string(),
  }).get_outer(),
  [(
    "/entry.pc", r#"
    import "some/dir/module2.pc" as mod

    component A {
    }
    "#
  ),(
    "/some/dir/module2.pc", r#"
    component B {
    }
    "#
  )]
}

case! {
  imports_in_new_path_are_changed,
  [
    (
      "/entry.pc", r#"
      component A {
      }
      "#
    ),
    (
      "/some/module.pc", r#"
      import "/entry.pc" as entry

      component B {
      }
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/some/module.pc".to_string(),
      new_path: "/some/dir/module2.pc".to_string(),
  }).get_outer(),
  [(
    "/some/dir/module2.pc", r#"
    import "../../entry.pc" as entry

    component B {
    }
    "#
  )]
}

case! {
  img_src_is_updated_when_file_is_moved,
  [
    (
      "/entry.pc", r#"
      img(src: "./test.svg")
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/entry.pc".to_string(),
      new_path: "/some/dir/entry.pc".to_string(),
  }).get_outer(),
  [(
    "/some/dir/entry.pc", r#"
    img(src: "../../test.svg")
    "#
  )]
}

case! {
  img_src_is_ignored_if_http_and_file_is_moved,
  [
    (
      "/entry.pc", r#"
      img(src: "http://localhost/test.svg")
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/entry.pc".to_string(),
      new_path: "/some/dir/entry.pc".to_string(),
  }).get_outer(),
  [(
    "/some/dir/entry.pc", r#"
    img(src: "http://localhost/test.svg")
    "#
  )]
}

case! {
  decl_url_is_updated_when_file_is_moved,
  [
    (
      "/entry.pc", r#"
      style {
        background: url("./img.svg")
      }
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/entry.pc".to_string(),
      new_path: "/some/dir/entry.pc".to_string(),
  }).get_outer(),
  [(
    "/some/dir/entry.pc", r#"

    style {
      background: url("../../img.svg")
    }
    "#
  )]
}
case! {
  decl_url_is_ignored_if_http_and_file_is_moved,
  [
    (
      "/entry.pc", r#"
      style {
        background: url("http://localhost/img.svg")
      }
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/entry.pc".to_string(),
      new_path: "/some/dir/entry.pc".to_string(),
  }).get_outer(),
  [(
    "/some/dir/entry.pc", r#"

    style {
      background: url("http://localhost/img.svg")
    }
    "#
  )]
}

case! {
  pc_file_is_updated_if_resource_moved,
  [
    (
      "/entry.pc", r#"
      style {
        background: url("img.svg")
        background: url("dont-touch.svg")
      }
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/img.svg".to_string(),
      new_path: "/some/dir/img.svg".to_string(),
  }).get_outer(),
  [(
    "/entry.pc", r#"

    style {
      background: url("some/dir/img.svg")
      background: url("dont-touch.svg")
    }
    "#
  )]
}
case! {
  img_src_is_update_if_resource_is_moved,
  [
    (
      "/entry.pc", r#"
      img (src: "img.svg")
      img (src: "./dont-touch.svg")
      "#
    )
  ],
  mutation::Inner::UpdateDependencyPath(UpdateDependencyPath {
      old_path: "/img.svg".to_string(),
      new_path: "/some/dir/img.svg".to_string(),
  }).get_outer(),
  [(
    "/entry.pc", r#"
    img(src: "some/dir/img.svg")
    img(src: "./dont-touch.svg")
    "#
  )]
}

case! {
  refs_are_updated_when_component_is_moved,
  [
      (
          "/entry.pc", r#"
          import "/a.pc" as mod

          mod.A
          "#
      ),
        (
            "/a.pc", r#"
            public component A {
                render div {

                }
            }
            "#
          ),

          (
              "/b.pc", r#"
              "#
            )
  ],
  mutation::Inner::MoveExpressionToFile(MoveExpressionToFile {
      expression_id: "98523c41-3".to_string(),
      new_file_path: "/b.pc".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    import "./b.pc" as module
    import "/a.pc" as mod

    module.A
    "#
  ),
  (
      "/a.pc", r#"
      "#
    ),
  (
      "/b.pc", r#"

      public component A {
          render div
      }
      "#
    )]
}

case! {
  refs_are_updated_when_style_is_moved,
  [
      (
          "/entry.pc", r#"
          import "/a.pc" as mod

          div {
            style extends mod.test
          }
          "#
      ),
        (
            "/a.pc", r#"
            public style test {
                color: blue
            }
            "#
          ),

          (
              "/b.pc", r#"
              "#
            )
  ],
  mutation::Inner::MoveExpressionToFile(MoveExpressionToFile {
      expression_id: "98523c41-3".to_string(),
      new_file_path: "/b.pc".to_string()
  }).get_outer(),
  [(
    "/entry.pc", r#"
    import "./b.pc" as module
    import "/a.pc" as mod

    div {
        style extends module.test
    }
    "#
  ),
  (
      "/a.pc", r#"
      "#
    ),
  (
      "/b.pc", r#"
      public style test {
          color: blue
      }
      "#
    )]
}
