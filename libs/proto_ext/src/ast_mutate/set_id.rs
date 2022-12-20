use convert_case::Case;
use paperclip_proto::{ast_mutate::{SetId, mutation_result, ExpressionUpdated}, ast::{all::ExpressionWrapper}};
use super::utils::{get_valid_name, get_unique_component_id};

use crate::ast::{all::MutableVisitor, get_expr::{get_ref_id, get_expr_dep}};

use super::EditContext;



macro_rules! set_name {
    ($self: expr, $expr: expr, $value: expr) => {
        if $expr.id == $self.mutation.expression_id {
          $expr.name = $value;
          $self.changes.push(mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
            id: $expr.id.to_string()
          }).get_outer());
          true
        } else {
          false
        }

    };
}

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetId> {
  fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> crate::ast::all::VisitorResult<()> {

    if set_name!(self, expr, Some(get_valid_name(&self.mutation.value, Case::Camel))) {
      return crate::ast::all::VisitorResult::Continue;
    }

    if let Some(ref_id) = get_ref_id(expr.into(), &self.graph) {
      if ref_id == self.mutation.expression_id {

        let info = get_expr_dep(&self.mutation.expression_id, &self.graph).unwrap();
        match &info.0 {
          ExpressionWrapper::Component(comp) => {
            if comp.name != self.mutation.value {
              expr.tag_name = get_unique_component_id(&self.mutation.value, info.1);
              self.changes.push(mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                id: expr.id.to_string()
              }).get_outer());
            }
          }, 
          _ => {}
        }
      }
    } 

    crate::ast::all::VisitorResult::Continue
  }
  fn visit_style(&mut self, expr: &mut paperclip_proto::ast::pc::Style) -> crate::ast::all::VisitorResult<()> {
    set_name!(self, expr, Some(get_valid_name(&self.mutation.value, Case::Camel)));
    crate::ast::all::VisitorResult::Continue
  }
  fn visit_insert(&mut self, _expr: &mut paperclip_proto::ast::pc::Insert) -> crate::ast::all::VisitorResult<()> {
    // TODO - ensure that this is renamed if assoc slot is
    crate::ast::all::VisitorResult::Continue
  }
  fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> crate::ast::all::VisitorResult<()> {
    set_name!(self, expr, get_valid_name(&self.mutation.value, Case::Camel));
    crate::ast::all::VisitorResult::Continue
  }
  fn visit_component(&mut self, expr: &mut paperclip_proto::ast::pc::Component) -> crate::ast::all::VisitorResult<()> {
    if expr.name != self.mutation.value {
      set_name!(self, expr, get_unique_component_id(&self.mutation.value, &self.graph.dependencies.get(&self.path).unwrap()));
    }
    crate::ast::all::VisitorResult::Continue
  }
  fn visit_text_node(&mut self, expr: &mut paperclip_proto::ast::pc::TextNode) -> crate::ast::all::VisitorResult<()> {
    set_name!(self, expr, Some(get_valid_name(&self.mutation.value, Case::Camel)));
    crate::ast::all::VisitorResult::Continue
  }
  fn visit_atom(&mut self, expr: &mut paperclip_proto::ast::pc::Atom) -> crate::ast::all::VisitorResult<()> {
    set_name!(self, expr, get_valid_name(&self.mutation.value, Case::Camel));
    crate::ast::all::VisitorResult::Continue
  }
}