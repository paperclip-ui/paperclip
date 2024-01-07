use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast_mutate::{mutation_result, ExpressionDeleted};
use paperclip_proto::{
    ast::{pc::node, wrapper::Expression},
    ast_mutate::MoveNode,
};

use super::utils::upsert_render_expr;
use super::EditContext;
use crate::proto::ast::duplicate::Duplicate;
use crate::try_remove_child;

#[macro_export]
macro_rules! move_child {
    ($self: expr, $expr: expr) => {{
        if let Some(_) = try_remove_child!($expr.body, &$self.mutation.node_id) {
            $self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: $self.mutation.node_id.to_string(),
                })
                .get_outer(),
            );
        }

        let target_pos = $expr
            .body
            .iter()
            .position(|x| x.get_id() == $self.mutation.target_id);

        let pos = if let Some(pos) = target_pos {
            pos as i32
        } else {
            -1
        };

        if ($expr.id == $self.mutation.target_id && $self.mutation.position == 2)
            || (pos > -1 && $self.mutation.position != 2)
        {
            let child: Node = $self
                .expr_map
                .get_expr(&$self.mutation.node_id)
                .expect("Expr must exist")
                .duplicate()
                .try_into()
                .expect("Cannot convert to Node");

            if $self.mutation.position == 2 {
                $expr.body.push(child);
            } else if $self.mutation.position == 0 {
                $expr.body.insert(pos as usize, child);
            } else if $self.mutation.position == 1 {
                $expr
                    .body
                    .insert((pos + 1).try_into().expect("Can't increase pos"), child);
            }
        }

        VisitorResult::Continue
    }};
}

impl MutableVisitor<()> for EditContext<MoveNode> {
    fn visit_element(
        &self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }
    fn visit_slot(
        &self,
        expr: &mut paperclip_proto::ast::pc::Slot,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }
    fn visit_insert(
        &self,
        expr: &mut paperclip_proto::ast::pc::Insert,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }
    fn visit_document(
        &self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }

    fn visit_component(
        &self,
        expr: &mut paperclip_proto::ast::pc::Component,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        if self.mutation.target_id != expr.id {
            return VisitorResult::Continue;
        }

        if self.mutation.position != 2 {
            return VisitorResult::Continue;
        }

        let node: Node = self
            .expr_map
            .get_expr(&self.mutation.node_id)
            .expect("Expr must exist")
            .duplicate()
            .try_into()
            .expect("Must be node");

        let existing_render_node = upsert_render_expr(expr, false, &self);

        if let Some(render_node) = &mut existing_render_node.node {
            append_child(render_node, node);
        } else {
            existing_render_node.node = Some(node);
        }

        VisitorResult::Continue
    }
}

fn append_child(node: &mut Node, child: Node) {
    match node.get_inner_mut() {
        node::Inner::Element(expr) => {
            expr.body.push(child.duplicate());
        }
        node::Inner::Text(expr) => {
            expr.body.push(child.duplicate());
        }
        _ => {}
    }
}
