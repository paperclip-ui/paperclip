use paperclip_common::get_or_short;
use paperclip_parser::{pc::{parser::parse}, base};
use paperclip_proto::{ast_mutate::ConvertToComponent, ast::{all::{Expression, ExpressionWrapper}, pc::{document_body_item, Element, Component, Document, DocumentBodyItem}}};
use paperclip_ast_serialize::serializable::Serializable;

use crate::ast::{all::{Visitor, VisitorResult}, get_expr::GetExpr};
use super::EditContext;


macro_rules! replace_child_with_instance {
    ($ctx: expr, $children: expr) => {

    };
}

impl<'a> Visitor<()> for EditContext<'a, ConvertToComponent> {
  fn visit_document(&mut self, expr: &mut paperclip_proto::ast::pc::Document) -> VisitorResult<()> {

    let found_expr = get_or_short!(GetExpr::get_expr(&self.mutation.expression_id, expr), VisitorResult::Continue);
    
    println!("FOUNDDDD {:?}", found_expr);

    let checksum = expr.checksum();
    let new_component = create_component(&get_component_name(&found_expr, expr), found_expr.serialize().as_str(), &checksum);


    let insert_index = get_component_insert_index(expr);

    expr.body.insert(insert_index, document_body_item::Inner::Component(new_component).get_outer());


    for (i, v) in expr.body.iter_mut().enumerate() {
      if v.get_id() == &self.mutation.expression_id {
        let target: ExpressionWrapper = v.into();
        let component_name = get_component_name(&target, self.dependency.document.as_ref().unwrap());
        let rep: DocumentBodyItem = document_body_item::Inner::Element(create_element(&component_name, &checksum)).get_outer();
        std::mem::replace(v, rep);
      }
    }
      
    VisitorResult::Continue
  }
  fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> crate::ast::all::VisitorResult<()> {
    if expr.id != self.mutation.expression_id {
      return VisitorResult::Continue
    }
    VisitorResult::Continue
  }
  fn visit_text_node(&mut self, expr: &mut paperclip_proto::ast::pc::TextNode) -> crate::ast::all::VisitorResult<()> {
      VisitorResult::Continue
  }
}


fn get_component_insert_index(expr: &Document) -> usize {

  let first_component = expr.body.iter().enumerate().find(|(i, item)| {
    matches!(item.get_inner(), document_body_item::Inner::Component(_))
  }).or(expr.body.iter().enumerate().find(|(i, item)| {
    matches!(item.get_inner(), document_body_item::Inner::Import(_))
  }));

  if let Some((i, _)) = first_component {
    i
  } else {
    0
  }
}

fn get_component_name(expr: &ExpressionWrapper, doc: &Document) -> String {
  let base_name = match expr {
    ExpressionWrapper::Element(element) => {
      element.name.clone()
    },
    _ => None
  };

  get_unique_component_name(&base_name.unwrap_or("Unnamed".to_string()), doc)
}

fn get_unique_component_name(base_name: &str, doc: &Document) -> String {
  let components = doc.get_components();

  let mut name = base_name.to_string();
  let mut i = 0;

  loop {

    let found_component = components.iter().find(|component| {
      component.name == name
    });

    if matches!(found_component, None) {
      break;
    }

    i += 1;
    name = format!("{}{}", base_name, i);
  }

  name
}

fn create_element(tag_name: &str, checksum: &str) -> Element {
  let doc = parse(tag_name, checksum).unwrap();
  match doc.body.get(0).unwrap().get_inner() {
    document_body_item::Inner::Element(element) => Some(element),
    _ => None
  }.unwrap().clone()
}

fn create_component(name: &str, render: &str, checksum: &str) -> Component {
  let doc = parse(format!(r#"
    public component {} {{
      render {}
    }}
  "#, name, render).as_str(), checksum).unwrap();
  match doc.body.get(0).unwrap().get_inner() {
    document_body_item::Inner::Component(expr) => Some(expr),
    _ => None
  }.unwrap().clone()
}