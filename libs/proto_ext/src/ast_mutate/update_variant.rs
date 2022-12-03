use paperclip_parser::{pc::parser::parse};
use paperclip_proto::{ast_mutate::{UpdateVariant, MutationResult, update_variant_trigger, mutation_result, ExpressionUpdated}, ast::{all::Expression, pc::ComponentBodyItem}};

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
    "#, self.mutation.name, self.mutation.triggers.iter().map(|trigger| {
      match trigger.get_inner() {
        update_variant_trigger::Inner::Str(mutation) => {        
          format!("\"{}\"", mutation.value)
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