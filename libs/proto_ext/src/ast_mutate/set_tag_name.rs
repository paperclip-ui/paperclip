use super::base::EditContext;
use super::utils::upsert_render_node;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::SetTagName;
use paperclip_proto::{
    ast::{
        all::{ ExpressionWrapper},
        pc::{document_body_item, node},
    },
    ast_mutate::MoveNode,
};

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetTagName> {
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.element_id {
            expr.tag_name = self.mutation.tag_name.clone();
            VisitorResult::Return(())
        } else {
            VisitorResult::Continue
        }
    }
    fn visit_component(&mut self, expr: &mut ast::pc::Component) -> VisitorResult<()> {
        if expr.get_id() != &self.mutation.element_id {
            return VisitorResult::Continue
        }
        let render_node = upsert_render_node(expr);
        if let Some(node) = &mut render_node.node {
            if let node::Inner::Element(element) = node.get_inner_mut() {
                element.tag_name = self.mutation.tag_name.clone();
            }
        } else {
            render_node.node = Some(node::Inner::Element(ast::pc::Element {
                tag_name: self.mutation.tag_name.clone(),
                ..Default::default()
            }).get_outer());
        }
        VisitorResult::Return(())
    }
}
