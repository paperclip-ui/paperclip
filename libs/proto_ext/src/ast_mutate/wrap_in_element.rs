use paperclip_proto::ast_mutate::{mutation_result, ExpressionDeleted, WrapInElement};
use paperclip_proto::{
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{document_body_item, node},
    },
    ast_mutate::MoveNode,
};

use super::utils::parse_node;
use super::EditContext;
use crate::{
    ast::{
        all::{MutableVisitor, VisitorResult},
        get_expr::get_expr_dep,
    },
    try_remove_child,
};

#[macro_export]
macro_rules! wrap_in_element {
    ($self: expr, $children: expr) => {{
        if let Some((i, child)) = try_remove_child!($children, $self.mutation.target_id) {
            let mut container = parse_node("div", &child.checksum());
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

impl<'a> MutableVisitor<()> for EditContext<'a, WrapInElement> {
    fn visit_document(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {
        wrap_in_element!(self, expr.body)
    }

    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        wrap_in_element!(self, expr.body)
    }
}
