use paperclip_proto::ast::{pc::node, wrapper::Expression};
use paperclip_proto::ast_mutate::WrapInElement;
use paperclip_proto::ast_mutate::{mutation_result, ExpressionInserted};

use super::utils::parse_node;
use super::EditContext;
use crate::try_remove_child;
use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};

#[macro_export]
macro_rules! wrap_in_element {
    ($self: expr, $children: expr) => {{
        if let Some((i, child)) = try_remove_child!($children, $self.mutation.target_id) {
            let mut container = parse_node("div", &$self.new_id());

            $self.add_change(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: container.get_id().to_string(),
                })
                .get_outer(),
            );

            match &mut container.get_inner_mut() {
                node::Inner::Element(element) => {
                    element.body.push(child.try_into().unwrap());
                }
                _ => {}
            }
            $children.insert(i, container.try_into().unwrap());

            VisitorResult::Return(())
        } else {
            VisitorResult::Continue
        }
    }};
}

impl MutableVisitor<()> for EditContext<WrapInElement> {
    fn visit_document(
        &self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<(), Self> {
        wrap_in_element!(self, expr.body)
    }

    fn visit_element(
        &self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> VisitorResult<(), Self> {
        wrap_in_element!(self, expr.body)
    }
    fn visit_insert(&self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<(), Self> {
        wrap_in_element!(self, expr.body)
    }
    fn visit_slot(&self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<(), Self> {
        wrap_in_element!(self, expr.body)
    }
}
