/**
 * TODO: return error if cannot paste in a particular spot. E.g: slots in document
 */
use paperclip_ast_serialize::pc::serialize_node;
use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::graph_ext::Dependency;
use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast::{all::Expression, pc::node};
use paperclip_proto::ast_mutate::{paste_expression, PasteExpression};

use super::EditContext;
use crate::ast::all::{MutableVisitor, VisitorResult};
use crate::ast_mutate::utils::parse_node;

#[macro_export]
macro_rules! paste_expr {
    ($self: expr, $expr: expr) => {{
        if $self.mutation.target_expression_id != $expr.id {
            return VisitorResult::Continue;
        }

        let item = $self.mutation.item.as_ref().expect("item must exist");

        let node = clone_pasted_expr(item, $self.get_dependency());

        if let Some(node) = node {
            $expr.body.push(node);
        }

        VisitorResult::Return(())
    }};
}

fn clone_pasted_expr(expr: &paste_expression::Item, dep: &Dependency) -> Option<Node> {
    let node = match expr {
        paste_expression::Item::Element(el) => Some(node::Inner::Element(el.clone()).get_outer()),
        paste_expression::Item::TextNode(el) => Some(node::Inner::Text(el.clone()).get_outer()),
    };

    if let Some(node) = node {
        // Clone node to refresh IDs
        let mut context = Context::new(0);
        serialize_node(&node, &mut context);
        Some(parse_node(
            &context.buffer,
            &dep.document.as_ref().unwrap().checksum(),
        ))
    } else {
        None
    }
}

impl<'a> MutableVisitor<()> for EditContext<'a, PasteExpression> {
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        paste_expr!(self, expr)
    }
    fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        paste_expr!(self, expr)
    }
    fn visit_insert(&mut self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
        paste_expr!(self, expr)
    }
    fn visit_document(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {
        if self.mutation.target_expression_id != expr.id {
            return VisitorResult::Continue;
        }
        let item = self.mutation.item.as_ref().expect("item must exist");

        let node = clone_pasted_expr(item, self.get_dependency());

        if let Some(node) = node {
            expr.body
                .push(node.try_into().expect("Unable to cast ast document item"));
        }

        VisitorResult::Return(())
    }
}
