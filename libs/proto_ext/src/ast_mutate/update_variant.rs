
use paperclip_parser::{pc::parser::parse};
use paperclip_proto::{ast_mutate::{UpdateVariant, MutationResult, update_variant_trigger, mutation_result, ExpressionUpdated}, ast::{all::Expression, pc::{ComponentBodyItem, Component, component_body_item}}};
use convert_case::{Case, Casing};
use regex::Regex;

use crate::ast::all::{Visitor, VisitorResult};

use super::EditContext;


impl<'expr> Visitor<Vec<MutationResult>> for EditContext<'expr, UpdateVariant> {
  fn visit_component(&mut self, expr: &mut paperclip_proto::ast::pc::Component) -> crate::ast::all::VisitorResult<Vec<MutationResult>> {

    if expr.id != self.mutation.component_id {
      return VisitorResult::Continue;
    }


    if let Some(variant_id) = &self.mutation.variant_id {
      expr.body = expr.body.clone().into_iter().filter(|expr| {
        expr.get_id() != variant_id
      }).collect::<Vec<ComponentBodyItem>>();
    }

    let mock_src = format!(r#"
      component Filler {{
        variant {} trigger {{
          {}
        }}
      }}
    "#, fix_variant_name(&self.mutation.name, &expr.body), self.mutation.triggers.iter().map(|trigger| {
      match trigger.get_inner() {
        update_variant_trigger::Inner::Str(value) => {        
          format!("\"{}\"", value)
        },
        update_variant_trigger::Inner::Boolean(value) => {        
          format!("{}", value)
        },
        _ => {
          "".to_string()
        }
      }
    }).collect::<Vec<String>>().join("\n"));


    // ooof...
    let doc = parse(&mock_src, &expr.checksum()).unwrap();
    let new_variants = doc.get_components().get(0).unwrap().get_variants();

    let variant = new_variants.get(0).unwrap().clone().clone();

    expr.body.insert(0, paperclip_proto::ast::pc::component_body_item::Inner::Variant(variant).get_outer());
    
    return VisitorResult::Return(vec![
      mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
        id: self.mutation.component_id.to_string()
      }).get_outer()
    ]);
  }
}


fn fix_variant_name(name: &str, siblings: &Vec<ComponentBodyItem>) -> String {
  get_unique_name(&get_valid_name(name), siblings)
}

fn get_valid_name(name: &str) -> String {
  let invalids = Regex::new("[^\\w\\s]+").unwrap();
  let invalid_start_char = Regex::new("^[^a-zA-Z]+").unwrap();
  let name = invalids.replace_all(&name, "");
  let name = invalid_start_char.replace_all(&name, "");
  name.to_case(Case::Camel)
}

fn get_unique_name(name: &str, siblings: &Vec<ComponentBodyItem>) -> String {
  let mut i = 0;
  let mut unique_name = name.to_string();

  loop {
    let contains_name = matches!(siblings.iter().find(|child| {
      if let component_body_item::Inner::Variant(child) = child.get_inner() {
        if child.name == unique_name {
          return true;
        }
      } 

      return false;
    }), Some(_));


    if !contains_name {
      break;
    }

    i += 1;

    unique_name = format!("{}{}", name, i);
  }

  unique_name
}