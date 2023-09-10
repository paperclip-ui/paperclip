use super::utils::{get_unique_component_name, get_valid_name};
use convert_case::Case;
use paperclip_proto::{
    ast::all::{
        visit::{MutableVisitor, VisitorResult},
        ExpressionWrapper,
    },
    ast_mutate::{mutation_result, ExpressionUpdated, SetId},
};

use paperclip_proto::ast::get_expr::{get_expr_dep, get_ref_id};

use super::EditContext;

macro_rules! set_name {
    ($self: expr, $expr: expr, $value: expr) => {
        if $expr.id == $self.mutation.expression_id {
            $expr.name = $value;
            $self.add_change(
                mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                    id: $expr.id.to_string(),
                })
                .get_outer(),
            );
            true
        } else {
            false
        }
    };
}

impl MutableVisitor<()> for EditContext<SetId> {
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        if set_name!(
            self,
            expr,
            Some(get_valid_name(&self.mutation.value, Case::Camel))
        ) {
            return VisitorResult::Continue;
        }

        if let Some(ref_id) = get_ref_id(expr.into(), &self.graph) {
            if ref_id == self.mutation.expression_id {
                let info = get_expr_dep(&self.mutation.expression_id, &self.graph).unwrap();
                match &info.0 {
                    ExpressionWrapper::Component(comp) => {
                        if comp.name != self.mutation.value {
                            expr.tag_name = get_unique_component_name(&self.mutation.value, info.1);
                            self.add_change(
                                mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                                    id: expr.id.to_string(),
                                })
                                .get_outer(),
                            );
                        }
                    }
                    _ => {}
                }
            }
        }

        VisitorResult::Continue
    }
    fn visit_style(&mut self, expr: &mut paperclip_proto::ast::pc::Style) -> VisitorResult<()> {
        set_name!(
            self,
            expr,
            Some(get_valid_name(&self.mutation.value, Case::Camel))
        );
        VisitorResult::Continue
    }
    fn visit_insert(&mut self, _expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
        // TODO - ensure that this is renamed if assoc slot is
        VisitorResult::Continue
    }
    fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        set_name!(
            self,
            expr,
            get_valid_name(&self.mutation.value, Case::Camel)
        );
        VisitorResult::Continue
    }
    fn visit_component(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Component,
    ) -> VisitorResult<()> {
        if expr.name != self.mutation.value {
            set_name!(
                self,
                expr,
                get_unique_component_name(
                    &self.mutation.value,
                    &self.graph.dependencies.get(&self.path).unwrap()
                )
            );
        }
        VisitorResult::Continue
    }
    fn visit_text_node(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::TextNode,
    ) -> VisitorResult<()> {
        set_name!(
            self,
            expr,
            Some(get_valid_name(&self.mutation.value, Case::Camel))
        );
        VisitorResult::Continue
    }
    fn visit_atom(&mut self, expr: &mut paperclip_proto::ast::pc::Atom) -> VisitorResult<()> {
        set_name!(
            self,
            expr,
            get_valid_name(&self.mutation.value, Case::Camel)
        );
        VisitorResult::Continue
    }
}
