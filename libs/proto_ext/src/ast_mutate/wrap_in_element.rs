use paperclip_proto::ast::{all::Expression, pc::node};
use paperclip_proto::ast_mutate::WrapInElement;
use paperclip_proto::ast_mutate::{mutation_result, ExpressionInserted};

use super::utils::parse_node;
use super::EditContext;
use crate::{
    ast::all::{MutableVisitor, VisitorResult},
    try_remove_child,
};

#[macro_export]
macro_rules! wrap_in_element {
    ($self: expr, $children: expr) => {{
        if let Some((i, child)) = try_remove_child!($children, $self.mutation.target_id) {
            let doc = $self.get_dependency();
            let checksum = doc
                .document
                .as_ref()
                .expect("Document must exist")
                .checksum();
            let mut container = parse_node("div", &checksum);

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
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {
        wrap_in_element!(self, expr.body)
    }

    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        wrap_in_element!(self, expr.body)
    }
    fn visit_insert(&mut self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
        wrap_in_element!(self, expr.body)
    }
    fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        wrap_in_element!(self, expr.body)
    }
}
